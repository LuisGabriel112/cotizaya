import type { Material, Unidad } from "@/lib/quote";
import type { MaterialCsv } from "./csv";
import { claveDesdeNombre, nombreRepetido, validarPrecio } from "./edicion";

export type MaterialGuardado = Material & { clave: string };
export interface EntradaMaterial {
  nombre: string;
  linea?: string;
  unidad: Unidad;
  precio: string;
  piezaSingular?: string;
  piezaPlural?: string;
}
export type ResultadoCatalogo = { ok: true } | { ok: false; mensaje: string };
export interface RepositorioCatalogo {
  listar(): Promise<MaterialGuardado[]>;
  crear(material: MaterialCsv): Promise<void>;
  cambiarPrecio(id: string, centavos: number): Promise<void>;
  quitar(id: string): Promise<void>;
  plantillasQueUsan(clave: string): Promise<string[]>;
}

const FALLA = "No se pudo guardar. Intenta otra vez.";
const NO_EXISTE = "No encontramos ese material.";
const LISTO: ResultadoCatalogo = { ok: true };
const error = (mensaje: string): ResultadoCatalogo & { ok: false } => ({ ok: false, mensaje });

// Un fallo de la base no se le suelta al taller: se le pide intentar otra vez.
const protegido = (operacion: () => Promise<ResultadoCatalogo>) => operacion().catch(() => error(FALLA));

function validarEntrada(entrada: EntradaMaterial): { ok: true; centavos: number } | { ok: false; mensaje: string } {
  if (!entrada.nombre.trim()) return error("Ponle un nombre al material.");
  const precio = validarPrecio(entrada.precio);
  if (!precio.ok) return precio;
  if (entrada.unidad === "pieza" && (!entrada.piezaSingular?.trim() || !entrada.piezaPlural?.trim())) {
    return error("Dinos cómo se llama la pieza, en singular y en plural.");
  }
  return precio;
}

function materialNuevo(entrada: EntradaMaterial, centavos: number, existentes: MaterialGuardado[]): MaterialCsv {
  return {
    clave: claveDesdeNombre(entrada.nombre, existentes.map((m) => m.clave)),
    nombre: entrada.nombre.trim(),
    linea: entrada.linea?.trim() ?? "",
    unidad: entrada.unidad,
    precioCentavos: centavos,
    ...(entrada.unidad === "pieza" ? { pieza: [entrada.piezaSingular!.trim(), entrada.piezaPlural!.trim()] as const } : {}),
  };
}

function mensajePlantillas(nombres: string[]): string {
  const citadas = nombres.map((nombre) => `"${nombre}"`);
  const lista = citadas.length === 1 ? citadas[0] : `${citadas.slice(0, -1).join(", ")} y ${citadas.at(-1)}`;
  return `No se puede quitar: lo ${nombres.length === 1 ? "usa la plantilla" : "usan las plantillas"} ${lista}.`;
}

async function agregar(repo: RepositorioCatalogo, entrada: EntradaMaterial): Promise<ResultadoCatalogo> {
  const validada = validarEntrada(entrada);
  if (!validada.ok) return validada;
  return protegido(async () => {
    const existentes = await repo.listar();
    if (nombreRepetido(entrada.nombre, existentes.map((m) => m.nombre))) return error("Ya tienes un material con ese nombre.");
    await repo.crear(materialNuevo(entrada, validada.centavos, existentes));
    return LISTO;
  });
}

async function cambiarPrecio(repo: RepositorioCatalogo, id: string, texto: string): Promise<ResultadoCatalogo> {
  const precio = validarPrecio(texto);
  if (!precio.ok) return precio;
  return protegido(async () => {
    if (!(await repo.listar()).some((m) => m.id === id)) return error(NO_EXISTE);
    await repo.cambiarPrecio(id, precio.centavos);
    return LISTO;
  });
}

async function quitar(repo: RepositorioCatalogo, id: string): Promise<ResultadoCatalogo> {
  return protegido(async () => {
    const material = (await repo.listar()).find((m) => m.id === id);
    if (!material) return error(NO_EXISTE);
    const plantillas = await repo.plantillasQueUsan(material.clave);
    if (plantillas.length) return error(mensajePlantillas(plantillas));
    await repo.quitar(id);
    return LISTO;
  });
}

export const crearCasosCatalogo = (repo: RepositorioCatalogo) => ({
  agregar: (entrada: EntradaMaterial) => agregar(repo, entrada),
  cambiarPrecio: (id: string, precio: string) => cambiarPrecio(repo, id, precio),
  quitar: (id: string) => quitar(repo, id),
});
