// Sin CLI de Supabase ni Docker: las migraciones se aplican con psql/pg y se anotan en
// supabase_migrations.schema_migrations, la misma tabla que usa la CLI.

export const versionDe = (archivo: string): string => archivo.split("_")[0]!;

export function pendientes(archivos: readonly string[], aplicadas: ReadonlySet<string>): string[] {
  return archivos
    .filter((a) => a.endsWith(".sql"))
    .sort()
    .filter((a) => !aplicadas.has(versionDe(a)));
}

/** La base local de prueba (stub-local.sql) no usa SSL; la de Supabase sí. */
export function opcionesSsl(url: string): false | { rejectUnauthorized: false } {
  return /@(localhost|127\.0\.0\.1)[:/]/.test(url) ? false : { rejectUnauthorized: false };
}
