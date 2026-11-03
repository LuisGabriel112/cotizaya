#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
logs="${CHECK_LOG_DIR:-/tmp/cotizaya-check}"
mkdir -p "$logs" || exit 1
run() {
  local name="$1"; shift
  if "$@" >"$logs/$name.log" 2>&1; then
    printf '%s OK\n' "$name"
  else
    local code=$?
    tail -n 35 "$logs/$name.log"
    printf '%s FAIL (%s); log: %s/%s.log\n' "$name" "$code" "$logs" "$name"
    return "$code"
  fi
}
run lint pnpm exec eslint src || exit $?
run types pnpm typecheck || exit $?
if [[ "${CHECK_SCOPE:-full}" == "unit" ]]; then
  run unit pnpm exec vitest run src || exit $?
  echo 'UNIT CHECK OK (sin base, E2E ni build)'
  exit 0
fi
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo 'CHECK BLOCKED: falta SUPABASE_DB_URL de PostgreSQL local de pruebas.'
  exit 2
fi
run tests pnpm test || exit $?
run e2e pnpm test:e2e || exit $?
run build pnpm build || exit $?
echo 'CHECK OK'
