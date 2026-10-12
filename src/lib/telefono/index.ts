// Teléfonos de México como los guarda Supabase Auth: 52 + 10 dígitos, sin "+".

const LADA_PAIS = "52";

/** Lo que el maestro escriba → "52" + 10 dígitos, o null si no es un número de México. */
export function normalizarTelefono(texto: string): string | null {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length === 10) return LADA_PAIS + digitos;
  if (digitos.length === 12 && digitos.startsWith(LADA_PAIS)) return digitos;
  // Celulares viejos se marcaban 52 1 + 10 dígitos; el 1 ya no existe.
  if (digitos.length === 13 && digitos.startsWith("521")) return LADA_PAIS + digitos.slice(3);
  return null;
}

/** "522290000001" → "229 000 0001". Lo que no reconoce lo deja igual. */
export function formatTelefono(guardado: string): string {
  const diez = normalizarTelefono(guardado)?.slice(LADA_PAIS.length);
  if (!diez) return guardado;
  return `${diez.slice(0, 3)} ${diez.slice(3, 6)} ${diez.slice(6)}`;
}
