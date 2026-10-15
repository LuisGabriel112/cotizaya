import { Children, isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MaterialGuardado } from "@/lib/catalogo/casos";

const listar = vi.hoisted(() => vi.fn());
const Repositorio = vi.hoisted(() => vi.fn(function () { return { listar }; }));

vi.mock("@/lib/server/supabase/cliente", () => ({ clienteServidor: vi.fn().mockResolvedValue("db") }));
vi.mock("@/lib/server/supabase/sesion", () => ({ exigirTaller: vi.fn().mockResolvedValue({ workshopId: "taller-1" }) }));
vi.mock("@/lib/server/catalogo/repositorio", () => ({ RepositorioCatalogoSupabase: Repositorio }));
vi.mock("./editor-catalogo", () => ({ EditorCatalogo: () => null }));

import { EditorCatalogo } from "./editor-catalogo";
import Precios from "./page";

const VIDRIO: MaterialGuardado = { id: "m2", clave: "vidrio", nombre: "Vidrio claro", linea: "Vidrios", unidad: "m2", precioCentavos: 90000 };
const CORREDIZA: MaterialGuardado = { id: "m1", clave: "corrediza-3", nombre: "Corrediza 3 pulgadas", linea: "Corredizas", unidad: "m2", precioCentavos: 215000 };

type Pagina = ReactElement<{ children: ReactElement[] }>;
const hijos = (pagina: Pagina) => Children.toArray(pagina.props.children).filter(isValidElement) as ReactElement<Record<string, unknown>>[];

beforeEach(() => {
  vi.clearAllMocks();
  listar.mockResolvedValue([VIDRIO, CORREDIZA]);
});

describe("página /precios", () => {
  it("lee el catálogo del taller de la sesión", async () => {
    await Precios();
    expect(Repositorio).toHaveBeenCalledWith("db", "taller-1");
  });

  it("le pasa al editor los materiales agrupados por línea", async () => {
    const editor = hijos((await Precios()) as Pagina).find((hijo) => hijo.type === EditorCatalogo);
    expect(editor?.props.grupos).toEqual([
      { linea: "Corredizas", materiales: [CORREDIZA] },
      { linea: "Vidrios", materiales: [VIDRIO] },
    ]);
  });

  it("lleva el título 'Precios' y regresa a las cotizaciones", async () => {
    const encabezado = hijos((await Precios()) as Pagina).find((hijo) => hijo.props.titulo === "Precios");
    expect(encabezado?.props.atras).toEqual({ href: "/cotizaciones", texto: "Cotizaciones" });
  });
});
