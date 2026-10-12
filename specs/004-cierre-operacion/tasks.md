# Tasks: Cierre y operación

## Phase 1: Setup

- [X] T001 Extender DTO disputa/cierre/avisos/preferencias/operación en packages/api-contracts/src/index.ts.

## Phase 2: Foundational

- [X] T002 Añadir datos de disputa/cierre/eventos y flags a backend/src/shared/database/.

## Phase 3: US1 — Aceptar/disputar

Prueba independiente: dos órdenes entregadas, aceptar una y disputar otra.

- [X] T003 [US1] Implementar aceptación/disputa idempotente antes48h, precio total separado y bloqueo despacho en backend/src/modules/orders/.
- [X] T004 [US1] Crear decisiones y confirmaciones con motivo/evidencia mínima en frontend/src/modules/jobs/.

## Phase 4: US2 — Resolver/reclamar

Prueba independiente: actores/clock controlados y una salida total por orden.

- [X] T005 [US2] Implementar respuesta/renuncia proveedor y árbitro independiente asignado antes7d en backend/src/modules/orders/.
- [X] T006 [US2] Implementar claims desde30min/15min/48h/7d con fechas persistidas y frontera exacta en backend/src/modules/orders/.
- [X] T007 [US2] Crear respuesta ventas/arbitraje/claims y confirmaciones en frontend/src/modules/sales/ y frontend/src/modules/operations/.

## Phase 5: US3 — Operar/avisos

Prueba independiente: panel propio, lectura avisos sin dinero, pausa sin bloquear cierre.

- [X] T008 [US3] Crear ventas propias sin código comprador, avisos y preferencias en backend/src/modules/notifications/ y backend/src/modules/orders/.
- [X] T009 [US3] Implementar control auditado admisión/gasto y archivo/supresión coherente en backend/src/modules/operations/ y backend/src/modules/jobs/.
- [X] T010 [US3] Crear ventas, avisos, ajustes y control local en frontend/src/modules/sales/, frontend/src/modules/notifications/, frontend/src/modules/settings/ y frontend/src/modules/operations/.

## Phase 6: Polish

- [X] T011 Verificar T1–T10, fronteras, doble cierre, conflicto y reinicio con SQLite/reloj en backend/tests/closure.test.ts.
- [X] T012 Verificar aceptación/disputa/arbitraje y aviso→origen en tests/e2e/; documentar simulación en README.md.

## Dependencies & Parallel Execution

001/003→T001→T002→US1→US2/US3→verificación. UI/backend pueden avanzar por contratos,
pero cierre debe usar máquina orders existente. MVP US1; completar alternativasUS2 y operaciónUS3.

## Evidencia de cierre

Implementación verificada el 2026-10-12: build aprobado, 17 pruebas de backend y 6 E2E.
[Informe de validación y límites](../../docs/local-acceptance-report.md).
Dockerfiles y Compose preparados; arranque de contenedores pendiente por ausencia de Docker.
