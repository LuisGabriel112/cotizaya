// Lo que el maestro teclea en obra, convertido a los enteros que usa el cálculo.

const CIFRA = /^(\d*)(?:[.,](\d*))?$/;

/**
 * Deja solo lo que cabe en el campo mientras se teclea: dígitos y, si se permite,
 * un separador decimal (punto o coma) con una cifra después.
 */
export function limpiarCifra(texto: string, { enteros, decimal = false }: { enteros: number; decimal?: boolean }): string {
  let entero = "";
  let separador = ".";
  let fraccion: string | undefined;
  for (const ch of texto) {
    if (ch >= "0" && ch <= "9") {
      if (fraccion === undefined) {
        if (entero.length < enteros) entero += ch;
      } else if (fraccion.length < 1) fraccion += ch;
    } else if (decimal && (ch === "." || ch === ",") && fraccion === undefined) {
      separador = ch;
      fraccion = "";
    }
  }
  return fraccion === undefined ? entero : `${entero}${separador}${fraccion}`;
}

/** "120", "120.5" o "120,5" → cm enteros con redondeo half-up. Vacío, no número o ≤ 0 → null. */
export function parsearCm(texto: string): number | null {
  const m = CIFRA.exec(texto.trim());
  if (!m || (!m[1] && !m[2])) return null;
  const entero = Number(m[1] || "0");
  // Half-up: basta la primera cifra decimal (x.5… sube, x.4… no).
  const cm = entero + (Number(m[2]?.[0] ?? "0") >= 5 ? 1 : 0);
  return Number.isSafeInteger(cm) && cm > 0 ? cm : null;
}

/** Piezas iguales: entero de 1 a 99. Si no, null. */
export function parsearCantidad(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n >= 1 && n <= 99 ? n : null;
}

/** Porcentaje entero de 0 a 100; vacío es 0 y lo que pasa de 100 se queda en 100. No número → null. */
export function parsearDescuento(texto: string): number | null {
  const t = texto.trim();
  if (t === "") return 0;
  if (!/^\d+$/.test(t)) return null;
  return Math.min(100, Number(t));
}
