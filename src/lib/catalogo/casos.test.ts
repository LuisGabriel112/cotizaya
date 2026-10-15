import { describe, expect, it, vi } from "vitest";
import { crearCasosCatalogo, type EntradaMaterial, type MaterialGuardado, type RepositorioCatalogo } from "./casos";

const CORREDIZA: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };
const VIDRIO: MaterialGuardado = { id: "m2", clave: "vidrio", nombre: "Vidrio claro", linea: "Vidrios", unidad: "m2", precioCentavos: 90000 };

function preparar(cambios: Partial<RepositorioCatalogo> = {}): RepositorioCatalogo {
  return {
    listar: vi.fn().mockResolvedValue([CORREDIZA, VIDRIO]),
    crear: vi.fn().mockResolvedValue(undefined),
    cambiarPrecio: vi.fn().mockResolvedValue(undefined),
    quitar: vi.fn().mockResolvedValue(undefined),
    plantillasQueUsan: vi.fn().mockResolvedValue([]),
    ...cambios,
  };
}

const ENTRADA: EntradaMaterial = { nombre: "Vidrio filtrasol 6 mm", linea: "Vidrios", unidad: "m2", precio: "$1,480.50" };
const FALLA_GENERICA = { ok: false, mensaje: "No se pudo guardar. Intenta otra vez." };
const caida = () => vi.fn().mockRejectedValue(new Error("caída"));

describe("agregar", () => {
  it("guarda el material con clave automática y precio en centavos", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).agregar(ENTRADA)).toEqual({ ok: true });
    expect(repo.crear).toHaveBeenCalledWith({ clave: "vidrio-filtrasol-6-mm", nombre: "Vidrio filtrasol 6 mm", linea: "Vidrios", unidad: "m2", precioCentavos: 148050 });
  });

  it("recorta espacios y deja la línea vacía si no se pone", async () => {
    const repo = preparar();
    await crearCasosCatalogo(repo).agregar({ nombre: "  Silicón  ", unidad: "pieza", precio: "85", piezaSingular: " tubo ", piezaPlural: " tubos " });
    expect(repo.crear).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Silicón", linea: "", pieza: ["tubo", "tubos"] }));
  });

  it("sin nombre avisa y no guarda", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).agregar({ ...ENTRADA, nombre: "   " })).toEqual({ ok: false, mensaje: "Ponle un nombre al material." });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it.each(["", "0", "abc"])("precio %j avisa y no guarda", async (precio) => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).agregar({ ...ENTRADA, precio })).toEqual({ ok: false, mensaje: "Escribe un precio mayor a cero." });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it("un material por pieza pide singular y plural", async () => {
    const repo = preparar();
    const casos = crearCasosCatalogo(repo);
    const pedida = { ok: false, mensaje: "Dinos cómo se llama la pieza, en singular y en plural." };
    expect(await casos.agregar({ ...ENTRADA, unidad: "pieza" })).toEqual(pedida);
    expect(await casos.agregar({ ...ENTRADA, unidad: "pieza", piezaSingular: "jaladera" })).toEqual(pedida);
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it("guarda los nombres de la pieza", async () => {
    const repo = preparar();
    await crearCasosCatalogo(repo).agregar({ ...ENTRADA, nombre: "Jaladera", unidad: "pieza", piezaSingular: "jaladera", piezaPlural: "jaladeras" });
    expect(repo.crear).toHaveBeenCalledWith(expect.objectContaining({ unidad: "pieza", pieza: ["jaladera", "jaladeras"] }));
  });

  it("si no es por pieza ignora los nombres de pieza", async () => {
    const repo = preparar();
    await crearCasosCatalogo(repo).agregar({ ...ENTRADA, piezaSingular: "hoja", piezaPlural: "hojas" });
    expect(repo.crear).toHaveBeenCalledWith(expect.not.objectContaining({ pieza: expect.anything() }));
  });

  it("un nombre repetido (sin importar mayúsculas) no se crea", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).agregar({ ...ENTRADA, nombre: "corrediza 3 PULGADAS" })).toEqual({ ok: false, mensaje: "Ya tienes un material con ese nombre." });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  it("si la clave ya existe con otro nombre, le agrega un número", async () => {
    const repo = preparar();
    await crearCasosCatalogo(repo).agregar({ ...ENTRADA, nombre: "Vidrio!" });
    expect(repo.crear).toHaveBeenCalledWith(expect.objectContaining({ clave: "vidrio-2" }));
  });

  it("si la base falla, lo dice sin soltar el error", async () => {
    expect(await crearCasosCatalogo(preparar({ crear: caida() })).agregar(ENTRADA)).toEqual(FALLA_GENERICA);
  });
});

describe("cambiarPrecio", () => {
  it("guarda el precio nuevo en centavos", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).cambiarPrecio("m1", "2,300")).toEqual({ ok: true });
    expect(repo.cambiarPrecio).toHaveBeenCalledWith("m1", 230000);
  });

  it("un precio inválido avisa y no guarda", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).cambiarPrecio("m1", "0")).toEqual({ ok: false, mensaje: "Escribe un precio mayor a cero." });
    expect(repo.cambiarPrecio).not.toHaveBeenCalled();
  });

  it("un material que no es del taller no se toca", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).cambiarPrecio("ajeno", "100")).toEqual({ ok: false, mensaje: "No encontramos ese material." });
    expect(repo.cambiarPrecio).not.toHaveBeenCalled();
  });

  it("si la base falla, lo dice", async () => {
    expect(await crearCasosCatalogo(preparar({ cambiarPrecio: caida() })).cambiarPrecio("m1", "100")).toEqual(FALLA_GENERICA);
  });
});

describe("quitar", () => {
  it("quita un material que ninguna plantilla usa", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).quitar("m1")).toEqual({ ok: true });
    expect(repo.plantillasQueUsan).toHaveBeenCalledWith("corrediza-3");
    expect(repo.quitar).toHaveBeenCalledWith("m1");
  });

  it("si lo usa una plantilla, dice cuál y no lo quita", async () => {
    const repo = preparar({ plantillasQueUsan: vi.fn().mockResolvedValue(["Ventana corrediza"]) });
    expect(await crearCasosCatalogo(repo).quitar("m1")).toEqual({ ok: false, mensaje: 'No se puede quitar: lo usa la plantilla "Ventana corrediza".' });
    expect(repo.quitar).not.toHaveBeenCalled();
  });

  it("si lo usan varias plantillas, las nombra todas", async () => {
    const repo = preparar({ plantillasQueUsan: vi.fn().mockResolvedValue(["Ventana", "Puerta", "Canceles"]) });
    expect(await crearCasosCatalogo(repo).quitar("m1")).toEqual({ ok: false, mensaje: 'No se puede quitar: lo usan las plantillas "Ventana", "Puerta" y "Canceles".' });
  });

  it("un material que no es del taller no se toca", async () => {
    const repo = preparar();
    expect(await crearCasosCatalogo(repo).quitar("ajeno")).toEqual({ ok: false, mensaje: "No encontramos ese material." });
    expect(repo.quitar).not.toHaveBeenCalled();
  });

  it("si la base falla, lo dice", async () => {
    expect(await crearCasosCatalogo(preparar({ quitar: caida() })).quitar("m1")).toEqual(FALLA_GENERICA);
  });
});
