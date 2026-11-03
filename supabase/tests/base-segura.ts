export function validarBaseDePruebas(valor: string | undefined): void {
  let url;
  try { url = new URL(valor ?? ""); } catch { throw new Error("Base de pruebas no autorizada"); }
  if (!["postgres:","postgresql:"].includes(url.protocol)
      || !["127.0.0.1","localhost","[::1]"].includes(url.hostname)
      || !/^\/[a-z0-9_]+_test$/.test(url.pathname)) {
    throw new Error("Base de pruebas no autorizada: usa PostgreSQL local y nombre terminado en _test");
  }
}
