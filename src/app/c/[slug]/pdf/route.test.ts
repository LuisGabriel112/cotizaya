import { beforeEach, describe, expect, it, vi } from "vitest";

const { leerVistaPublica, armarDocumento, generarPdf } = vi.hoisted(() => ({
  leerVistaPublica: vi.fn(),
  armarDocumento: vi.fn(),
  generarPdf: vi.fn(),
}));

vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: async () => ({}) }));
vi.mock("@/lib/server/supabase/publica", async (original) => ({ ...(await original<object>()), leerVistaPublica }));
vi.mock("@/lib/server/pdf/documento", () => ({ armarDocumento }));
vi.mock("@/lib/server/pdf", () => ({ generarPdf }));

import { GET } from "./route";

const SLUG = "0042-a1b2c3d4e5f6";
const pedir = (slug: string) => GET(new Request(`http://x/c/${slug}/pdf`), { params: Promise.resolve({ slug }) });
const vista = { cotizacion: { folio: 42 }, taller: {} };

beforeEach(() => {
  vi.clearAllMocks();
  leerVistaPublica.mockResolvedValue(vista);
  armarDocumento.mockReturnValue({ folio: "0042" });
  generarPdf.mockResolvedValue(new TextEncoder().encode("%PDF-1.3"));
});

describe("GET /c/[slug]/pdf", () => {
  it("entrega el PDF con nombre por folio", async () => {
    const r = await pedir(SLUG);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe("application/pdf");
    expect(r.headers.get("content-disposition")).toBe('inline; filename="cotizacion-0042.pdf"');
    expect(new TextDecoder().decode(await r.arrayBuffer())).toBe("%PDF-1.3");
    expect(armarDocumento).toHaveBeenCalledWith(vista);
  });

  it("no se guarda en cachés compartidas", async () => {
    expect((await pedir(SLUG)).headers.get("cache-control")).toBe("private, no-store");
  });

  it("slug inválido: 404 sin consultar la base", async () => {
    expect((await pedir("no-existe")).status).toBe(404);
    expect(leerVistaPublica).not.toHaveBeenCalled();
  });

  it("cotización inexistente: 404 sin generar PDF", async () => {
    leerVistaPublica.mockResolvedValue(null);
    expect((await pedir(SLUG)).status).toBe(404);
    expect(generarPdf).not.toHaveBeenCalled();
  });
});
