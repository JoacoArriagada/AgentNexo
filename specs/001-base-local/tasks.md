# Tasks: Base local

## Phase 1: Setup

- [X] T001 Crear workspaces y scripts build/test en package.json; fijar package-lock.json.
- [X] T002 Crear builds locales y contenedores en frontend/Dockerfile, backend/Dockerfile y docker-compose.yml sin variables secretas.

## Phase 2: Foundational

- [X] T003 Definir DTO públicos y errores en packages/api-contracts/src/index.ts sin IO.
- [X] T004 Crear conexión, schema y seed idempotente en backend/src/shared/database/.

## Phase 3: US1 — Abrir el prototipo

Objetivo: inicio directo; prueba independiente: contexto público y shell sin login.

- [X] T005 [US1] Componer servidor, health y errores en backend/src/app/ y backend/src/modules/context/.
- [X] T006 [US1] Crear shell, navegación y cliente API en frontend/src/app/ y frontend/src/shared/.

## Phase 4: US2 — Actores demo

Objetivo: cambiar responsabilidades; prueba: mismas entidades, acciones permitidas por actor.

- [X] T007 [US2] Resolver X-Actor-Id por petición en backend/src/modules/context/ con rechazo de actor desconocido.
- [X] T008 [US2] Crear selector persistido localmente y banner de simulación en frontend/src/app/.

## Phase 5: Polish

- [X] T009 Verificar seed/reinicio y errores con SQLite real en backend/tests/base.test.ts.
- [X] T010 Documentar instalación, puertos, simulación y limitación Docker en README.md; validar teclado/reflujo en tests/e2e/.

## Dependencies & Parallel Execution

T001→T003/T004→T005/T006→T007/T008→T009/T010. Backend y frontend pueden avanzar
sobre contratos después de T003; root conserva propiedad exclusiva de lock/Compose.
MVP US1; luego actores US2. No tareas de login ni servicios remotos.

## Evidencia de cierre

Implementación verificada el 2026-10-12: build aprobado, 17 pruebas de backend y 6 E2E.
[Informe de validación y límites](../../docs/local-acceptance-report.md).
Dockerfiles y Compose preparados; arranque de contenedores pendiente por ausencia de Docker.
