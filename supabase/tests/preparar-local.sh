#!/usr/bin/env sh
# Recrea la base local de prueba: stub de Supabase + migraciones.
# Uso: PGPORT=54329 sh supabase/tests/preparar-local.sh
set -e
P="psql -h ${PGHOST:-localhost} -p ${PGPORT:-5432} -U ${PGUSER:-postgres} -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "drop database if exists cotizaya_test" -c "create database cotizaya_test"
for f in supabase/tests/stub-local.sql supabase/migrations/*.sql; do
  $P -d cotizaya_test -f "$f"
done
echo "Listo: SUPABASE_DB_URL=postgres://${PGUSER:-postgres}@${PGHOST:-localhost}:${PGPORT:-5432}/cotizaya_test"
