# Tasks: Catálogo y ofertas

## Phase 1: Setup

- [X] T001 Extender DTO Offer/Moderation en packages/api-contracts/src/index.ts.

## Phase 2: Foundational

- [X] T002 Crear oferta/versiones en backend/src/modules/offers/repositories/; nombre 3–100, descripción 20–2000, priceMinor entero positivo.

## Phase 3: US1 — Explorar

Prueba independiente: visitante ve sólo aprobadas y filtro vacío recuperable.

- [X] T003 [US1] Implementar GET lista/ficha con filtros en backend/src/modules/offers/controllers/.
- [X] T004 [US1] Crear catálogo/ficha/filtros y estados en frontend/src/modules/catalog/.

## Phase 4: US2 — Publicar/versionar

Prueba independiente: proveedor guarda y envía versión, orden previa conserva snapshot.

- [X] T005 [US2] Implementar creación/edición/envío con expectedVersion e idempotencia en backend/src/modules/offers/services/.
- [X] T006 [US2] Crear mis ofertas/editor y validación en frontend/src/modules/offers/.

## Phase 5: US3 — Moderar

Prueba independiente: administrador decide con motivo y no puede autoaprobar.

- [X] T007 [US3] Implementar decisiones y eventos con conflicto bloqueado en backend/src/modules/offers/services/.
- [X] T008 [US3] Crear bandeja/confirmación de moderación en frontend/src/modules/moderation/.

## Phase 6: Polish

- [X] T009 Verificar catálogo, versiones, autoaprobación y suspensión con SQLite real en backend/tests/offers.test.ts.
- [X] T010 Integrar publicación→moderación→ficha y responsive en tests/e2e/.

## Dependencies & Parallel Execution

001→T001→T002→US1→US2→US3→verificación. UI y backend por historia pueden avanzar
con DTO definido y archivos separados. MVP US1 seeded; siguiente US2/US3.

## Phase 7: Convergence

- [X] T011 [US2] Añadir retirada por proveedor propietario con expectedVersion, motivo/confirmación, idempotencia y bloqueo de nuevas ventas sin modificar snapshots previos en backend/src/modules/offers/services/offer.service.ts, backend/src/modules/offers/controllers/offer.controller.ts, packages/api-contracts/src/index.ts y frontend/src/modules/offers/Offers.tsx per FR-009 y Clarifications retirada (missing).

## Evidencia de cierre

Implementación verificada el 2026-10-12: build aprobado, 17 pruebas de backend y 6 E2E.
[Informe de validación y límites](../../docs/local-acceptance-report.md).
Dockerfiles y Compose preparados; arranque de contenedores pendiente por ausencia de Docker.
