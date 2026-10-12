type Azar = (bytes: Uint8Array) => Uint8Array;

const azarDelSistema: Azar = (bytes) => crypto.getRandomValues(bytes);

/**
 * UUID v4 armado a mano: crypto.randomUUID solo existe en contextos seguros y el
 * maestro prueba la app por la IP de la red local, sin https.
 */
export function nuevoUuid(azar: Azar = azarDelSistema): string {
  const b = azar(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
