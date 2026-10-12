import { beforeEach, describe, expect, it, vi } from "vitest";

const { db, esAdmin, revalidatePath } = vi.hoisted(() => {
  const subir = { upload: vi.fn(), getPublicUrl: vi.fn() };
  return {
    db: { rpc: vi.fn(), from: vi.fn(), storage: { from: vi.fn(() => subir) }, subir, upsert: vi.fn() },
    esAdmin: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (ruta: string) => {
    throw new Error(`REDIRECT ${ruta}`);
  },
}));
vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => db }));
vi.mock("@/lib/server/supabase/sesion", () => ({ esAdmin }));
vi.mock("@/lib/cotizaciones/ids", () => ({ nuevoUuid: () => "u1" }));

import { activarPlan, altaTaller, importarCatalogo, subirLogo } from "./acciones";

const TALLER = "11111111-1111-4111-8111-111111111111";
const formulario = (campos: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.set(k, v);
  return f;
};
const alta = { nombre: "Vidrios Boca", telefono: "229 111 2222", ciudad: "Boca del Río", condiciones: "" };
const png = (bytes = 10) => new File([new Uint8Array(bytes)], "logo.png", { type: "image/png" });

beforeEach(() => {
  vi.clearAllMocks();
  esAdmin.mockResolvedValue(true);
  db.rpc.mockResolvedValue({ data: TALLER, error: null });
  db.from.mockReturnValue({ upsert: db.upsert });
  db.upsert.mockResolvedValue({ error: null });
  db.subir.upload.mockResolvedValue({ error: null });
  db.subir.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://x/logo.png" } });
});

describe("permiso de admin", () => {
  it("sin permiso responde 404 y no toca la base", async () => {
    esAdmin.mockResolvedValue(false);
    await expect(altaTaller(null, formulario(alta))).rejects.toThrow("NEXT_NOT_FOUND");
    expect(db.rpc).not.toHaveBeenCalled();
  });
});

describe("altaTaller", () => {
  it("normaliza el teléfono y lleva al taller nuevo", async () => {
    await expect(altaTaller(null, formulario(alta))).rejects.toThrow(`REDIRECT /admin/talleres/${TALLER}`);
    expect(db.rpc).toHaveBeenCalledWith("admin_alta_taller", { p_nombre: "Vidrios Boca", p_owner_phone: "522291112222", p_ciudad: "Boca del Río", p_condiciones: "" });
  });

  it("teléfono inválido no llega a la base", async () => {
    const r = await altaTaller(null, formulario({ ...alta, telefono: "123" }));
    expect(r).toEqual({ ok: false, mensaje: "Escribe el celular del dueño a 10 dígitos." });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("teléfono repetido avisa en claro", async () => {
    db.rpc.mockResolvedValue({ data: null, error: { code: "23505" } });
    expect((await altaTaller(null, formulario(alta))).mensaje).toBe("Ya hay un taller con ese teléfono.");
  });

  it("otro error pide reintentar", async () => {
    db.rpc.mockResolvedValue({ data: null, error: { code: "XX000" } });
    expect((await altaTaller(null, formulario(alta))).mensaje).toBe("No se pudo dar de alta. Intenta otra vez.");
  });
});

describe("subirLogo", () => {
  it("sube al bucket logos y guarda la URL pública", async () => {
    const r = await subirLogo(TALLER, null, formulario({ logo: png() }));
    expect(r).toEqual({ ok: true, mensaje: "Logo listo." });
    expect(db.storage.from).toHaveBeenCalledWith("logos");
    expect(db.rpc).toHaveBeenCalledWith("admin_poner_logo", { p_taller: TALLER, p_url: "https://x/logo.png" });
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/talleres/${TALLER}`);
  });

  it("sin archivo no sube nada", async () => {
    expect((await subirLogo(TALLER, null, formulario({}))).mensaje).toBe("Elige un archivo.");
    expect(db.subir.upload).not.toHaveBeenCalled();
  });

  it("archivo vacío se rechaza con la regla de validarLogo", async () => {
    expect((await subirLogo(TALLER, null, formulario({ logo: png(0) }))).mensaje).toBe("Elige un archivo.");
    expect(db.subir.upload).not.toHaveBeenCalled();
  });

  it("falla de subida avisa", async () => {
    db.subir.upload.mockResolvedValue({ error: { message: "x" } });
    expect((await subirLogo(TALLER, null, formulario({ logo: png() }))).mensaje).toBe("No se pudo subir el logo. Intenta otra vez.");
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("falla al guardar la URL avisa", async () => {
    db.rpc.mockResolvedValue({ data: null, error: { code: "x" } });
    expect((await subirLogo(TALLER, null, formulario({ logo: png() }))).ok).toBe(false);
  });

  it("id que no es UUID se rechaza", async () => {
    await expect(subirLogo("../otro", null, formulario({ logo: png() }))).rejects.toThrow();
  });
});

describe("importarCatalogo", () => {
  const csv = 'clave,nombre,linea,unidad,precio\ncorrediza-3,Corrediza 3",3",m2,"2,150.00"\nfelpa,Felpa,Mantenimiento,pieza,abc';

  it("guarda las líneas buenas por clave y reporta las malas", async () => {
    const r = await importarCatalogo(TALLER, null, formulario({ csv }));
    expect(db.from).toHaveBeenCalledWith("materials");
    const [filas, opciones] = db.upsert.mock.calls[0]!;
    expect(filas).toEqual([expect.objectContaining({ workshop_id: TALLER, clave: "corrediza-3", precio_centavos: 215000 })]);
    expect(opciones).toEqual({ onConflict: "workshop_id,clave" });
    expect(r.ok).toBe(false);
    expect(r.mensaje).toBe("Se guardaron 1 materiales. Revisa estas líneas:");
    expect(r.errores).toHaveLength(1);
  });

  it("todo bien responde ok", async () => {
    const r = await importarCatalogo(TALLER, null, formulario({ csv: csv.split("\n").slice(0, 2).join("\n") }));
    expect(r).toEqual({ ok: true, mensaje: "Se guardaron 1 materiales." });
  });

  it("sin líneas válidas no toca la base", async () => {
    const r = await importarCatalogo(TALLER, null, formulario({ csv: "" }));
    expect(r.mensaje).toBe("No se guardó nada.");
    expect(db.upsert).not.toHaveBeenCalled();
  });

  it("error de la base avisa", async () => {
    db.upsert.mockResolvedValue({ error: { code: "x" } });
    expect((await importarCatalogo(TALLER, null, formulario({ csv }))).mensaje).toBe("No se pudo guardar el catálogo. Intenta otra vez.");
  });
});

describe("activarPlan", () => {
  it("fundador con fecha", async () => {
    const r = await activarPlan(TALLER, null, formulario({ plan: "fundador", hasta: "2027-10-12" }));
    expect(db.rpc).toHaveBeenCalledWith("admin_activar_plan", { p_taller: TALLER, p_plan: "fundador", p_hasta: "2027-10-12" });
    expect(r).toEqual({ ok: true, mensaje: "Plan fundador activo hasta 2027-10-12." });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("gratis manda fecha nula", async () => {
    const r = await activarPlan(TALLER, null, formulario({ plan: "gratis", hasta: "" }));
    expect(db.rpc).toHaveBeenCalledWith("admin_activar_plan", { p_taller: TALLER, p_plan: "gratis", p_hasta: null });
    expect(r.mensaje).toBe("Quedó en plan gratis.");
  });

  it("fundador sin fecha no llega a la base", async () => {
    const r = await activarPlan(TALLER, null, formulario({ plan: "fundador", hasta: "" }));
    expect(r).toEqual({ ok: false, mensaje: "Pon hasta qué día queda activo." });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it("error de la base avisa", async () => {
    db.rpc.mockResolvedValue({ data: null, error: { code: "x" } });
    expect((await activarPlan(TALLER, null, formulario({ plan: "gratis", hasta: "" }))).mensaje).toBe("No se pudo cambiar el plan. Intenta otra vez.");
  });
});
