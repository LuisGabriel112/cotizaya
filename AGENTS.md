<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas del proyecto (Codex y Claude)

Lee `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md` y `docs/GUIA.md` antes de tocar nada; mandan sobre esto.
Protocolo estricto: Gherkin en `specs/`, luego tests, luego la implementación mínima, luego refactor.
Límites: función 4–20 líneas, archivo ≤500 líneas, complejidad ≤6, anidamiento ≤2, cero duplicación.
Dependencias inyectadas en la lógica de negocio. Comentarios solo para el "por qué".
Dinero en centavos (int), medidas en cm (int). Textos de interfaz en español de México, tuteo.
Antes de entregar corre `pnpm test`, `pnpm typecheck` y `pnpm exec eslint src`; deben salir limpios.
No hagas commit, push ni migraciones a la nube. No toques `.env*`.
