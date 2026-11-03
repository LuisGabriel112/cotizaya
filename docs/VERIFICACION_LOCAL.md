# Verificación sin servicios productivos

Node 24, pnpm 12.11.2 y Docker local. Ejecutar desde un worktree sin `.env.local`.
Las claves de ejemplo siguientes son exclusivamente de la base efímera local.

```bash
docker run -d --name cotizaya-test -e POSTGRES_PASSWORD=local-test-only \
  -e POSTGRES_DB=cotizaya_test -p 127.0.0.1:55439:5432 \
  --tmpfs /var/lib/postgresql/data postgres:16.15-bookworm
export SUPABASE_DB_URL=postgres://postgres:local-test-only@127.0.0.1:55439/cotizaya_test
# Esperar a que docker exec cotizaya-test pg_isready -U postgres termine con éxito.
node supabase/tests/preparar-seguro.mjs
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9
export NEXT_PUBLIC_SUPABASE_ANON_KEY=local-test-public-key
export NEXT_TELEMETRY_DISABLED=1
bash scripts/check.sh
```

El preparador exige loopback y nombre terminado en `_test`, no borra bases existentes
y aplica stub de Auth/Storage más todas las migraciones dentro de una transacción.
Prueba PostgreSQL real y RLS con JWT simulado; no sustituye E2E de Supabase Auth/PostgREST.
Los tests no cargan `.env.local`; el comando completo también rechaza worktrees que lo tengan.

`CHECK_SCOPE=unit bash scripts/check.sh` ejecuta lint, types y tests de app, indicando
explícitamente que excluye DB/E2E/build. Logs en `/tmp/cotizaya-check` o `CHECK_LOG_DIR`.
El modo completo requiere DB, ejecuta Vitest, Playwright demo y build, y preserva fallos.

El workflow check.yml usa PostgreSQL efímero, claves ficticias y acciones fijadas por SHA.
Está preparado para revisión; no se ha ejecutado en GitHub ni se ha hecho push.

Al terminar, detener y eliminar **solo** el contenedor de pruebas creado para esta sesión.
No ejecutar el script antiguo preparar-local.sh contra un servidor con bases reales.
