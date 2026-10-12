import type { Unidad } from "@/lib/quote";

// Catálogo que el admin pega desde una hoja de cálculo. Cada fila mala se reporta con
// su número de línea y las buenas se importan igual: el admin corrige solo lo que falló.

export interface MaterialCsv {
  clave: string;
  nombre: string;
  linea: string;
  unidad: Unidad;
  precioCentavos: number;
  pieza?: readonly [string, string];
}

export interface ResultadoCsv {
  materiales: MaterialCsv[];
  errores: string[];
}

const COLUMNAS = ["clave", "nombre", "linea", "unidad", "precio"] as const;
const PRECIO = /^\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/;
const UNIDADES: Record<string, Unidad> = { m2: "m2", "m²": "m2", ml: "ml", pieza: "pieza", pza: "pieza", pz: "pieza" };

/** "2,150.00" o "$1,850" → centavos. Negativo, más de 2 decimales o texto → null. */
export function parsearPrecioCentavos(texto: string): number | null {
  const m = PRECIO.exec(texto.trim());
  if (!m) return null;
  const centavos = Number(m[1]!.replaceAll(",", "")) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(centavos) ? centavos : null;
}

export function parsearCatalogoCsv(texto: string): ResultadoCsv {
  const [cabecera, ...filas] = leerRenglones(texto);
  const columnas = (cabecera?.campos ?? []).map((c) => c.trim().toLowerCase());
  const faltan = COLUMNAS.filter((c) => !columnas.includes(c));
  if (faltan.length > 0) return { materiales: [], errores: [`Faltan columnas: ${faltan.join(", ")}`] };

  const resultado: ResultadoCsv = { materiales: [], errores: [] };
  const vistas = new Set<string>();
  for (const fila of filas) {
    const material = validarFila(aRegistro(columnas, fila.campos), vistas);
    if (typeof material === "string") resultado.errores.push(`Línea ${fila.linea}: ${material}`);
    else resultado.materiales.push(material);
  }
  return resultado;
}

type Registro = Record<string, string>;

function aRegistro(columnas: string[], campos: string[]): Registro {
  return Object.fromEntries(columnas.map((c, i) => [c, (campos[i] ?? "").trim()]));
}

function validarFila(r: Registro, vistas: Set<string>): MaterialCsv | string {
  const unidad = UNIDADES[(r.unidad ?? "").toLowerCase()];
  const precioCentavos = parsearPrecioCentavos(r.precio ?? "");
  const problema = primerProblema([
    [!r.clave, "falta la clave"],
    [!r.nombre, "falta el nombre"],
    [!unidad, "unidad debe ser m2, ml o pieza"],
    [precioCentavos === null, "precio no es un número"],
    [vistas.has(r.clave!), `la clave ${r.clave} ya viene arriba`],
  ]);
  if (problema) return problema;
  vistas.add(r.clave!);
  return armarMaterial(r, unidad!, precioCentavos!);
}

function primerProblema(revisiones: [boolean, string][]): string | undefined {
  return revisiones.find(([falla]) => falla)?.[1];
}

function armarMaterial(r: Registro, unidad: Unidad, precioCentavos: number): MaterialCsv {
  const material: MaterialCsv = { clave: r.clave!, nombre: r.nombre!, linea: r.linea ?? "", unidad, precioCentavos };
  if (r.pieza_singular && r.pieza_plural) material.pieza = [r.pieza_singular, r.pieza_plural];
  return material;
}

// --- Lectura de CSV (RFC 4180, tolerante con comillas sueltas dentro de un campo) ---

interface Renglon {
  linea: number;
  campos: string[];
}

interface Lector {
  campos: string[];
  campo: string;
  comillas: boolean;
  linea: number;
  inicio: number;
  salida: Renglon[];
}

function leerRenglones(texto: string): Renglon[] {
  const l: Lector = { campos: [], campo: "", comillas: false, linea: 1, inicio: 1, salida: [] };
  for (let i = 0; i < texto.length; i++) {
    i = l.comillas ? dentroDeComillas(texto, i, l) : fueraDeComillas(texto, i, l);
  }
  cerrarRenglon(l);
  return l.salida.filter((r) => r.campos.some((c) => c.trim() !== ""));
}

function dentroDeComillas(texto: string, i: number, l: Lector): number {
  const ch = texto[i]!;
  if (ch !== '"') {
    if (ch === "\n") l.linea++;
    l.campo += ch;
    return i;
  }
  if (texto[i + 1] === '"') {
    l.campo += '"';
    return i + 1;
  }
  l.comillas = false;
  return i;
}

function fueraDeComillas(texto: string, i: number, l: Lector): number {
  const ch = texto[i]!;
  if (ch === '"' && l.campo === "") l.comillas = true;
  else if (ch === ",") nuevoCampo(l);
  else if (ch === "\n") nuevaLinea(l);
  else if (ch !== "\r") l.campo += ch;
  return i;
}

function nuevoCampo(l: Lector): void {
  l.campos.push(l.campo);
  l.campo = "";
}

function nuevaLinea(l: Lector): void {
  cerrarRenglon(l);
  l.linea++;
  l.inicio = l.linea;
}

function cerrarRenglon(l: Lector): void {
  nuevoCampo(l);
  l.salida.push({ linea: l.inicio, campos: l.campos });
  l.campos = [];
}
