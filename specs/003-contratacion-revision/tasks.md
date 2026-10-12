# Tasks: Contratación y revisión

## Phase 1: Setup

- [X] T001 Extender contratos Job/Policy/Order/Budget/Report/Payment en packages/api-contracts/src/index.ts.

## Phase 2: Foundational

- [X] T002 Crear schema/repositorios de snapshots, operaciones e idempotencia en backend/src/shared/database/.
- [X] T003 Crear utilidades dinero exacto y reloj/deadlines en backend/src/shared/.

## Phase 3: US1 — Encargo y política

Prueba independiente: guardar/aceptar y editar invalida aceptación.

- [X] T004 [US1] Crear DTO/controller/service jobs en backend/src/modules/jobs/ con título3–100, objetivo20–2000, criterios1–10 hasta500, archivos1–3 y1000líneas/262144bytes.
- [X] T005 [US1] Crear política versionada/digest/aceptación y permisos en backend/src/modules/jobs/.
- [X] T006 [US1] Crear formulario archivos/criterios y política sin aceptación preseleccionada en frontend/src/modules/jobs/.

## Phase 4: US2 — Orden/financiación

Prueba independiente: financiar sin iniciar; retry no duplica y capacidad rechaza antes fondos.

- [X] T007 [US2] Crear orders DTO/controller/service con snapshots y máximo10 plazas antes financiación en backend/src/modules/orders/.
- [X] T008 [US2] Implementar garantía y financiación demo idempotente en backend/src/modules/orders/.
- [X] T009 [US2] Crear términos, contratación y confirmación demo en frontend/src/modules/jobs/.

## Phase 5: US3 — Ejecución/informe

Prueba independiente: hallazgo de entrada conocida, presupuesto coherente y cancelación sin duplicación.

- [X] T010 [US3] Crear analizador estático y dispatcher durable, máximo2 tareas globales/2porjob,4llamadas/1reintento/10min en backend/src/modules/execution/.
- [X] T011 [US3] Crear reservas exactas/consumos/conciliación, A/B sólo fixture DEMO-01 en backend/src/modules/budgets/ y backend/src/modules/providers/.
- [X] T012 [US3] Implementar cancelación/eventos/reinicio sobre identidad estable en backend/src/modules/execution/.
- [X] T013 [US3] Generar reporte completo/parcial con citas existentes y executed=false; exportar MD/JSON en backend/src/modules/reports/.
- [X] T014 [US3] Crear detalle pestañas resumen/gastos/actividad/informe y descargas en frontend/src/modules/jobs/, frontend/src/modules/budgets/ y frontend/src/modules/reports/.

## Phase 6: Polish

- [X] T015 Verificar límites, invalidación, idempotencia, carrera0,03contra0,05 y reinicio con SQLite real en backend/tests/reviews.test.ts.
- [X] T016 Verificar contratación→informe, cancelación y exportación en tests/e2e/.

## Dependencies & Parallel Execution

001/002→T001→T002/T003→US1→US2→US3→verificación. Backend/frontend avanzan por
contratos en archivos separados; reports consume snapshots sin dependencia circular.
MVP US1; luego orden demo; luego recorrido completo con informe.

## Phase 7: Convergence

- [X] T017 [US3] Sustituir clasificación sustentado por coincidencia de palabras por evaluación conservadora con evidencia que respalde exactamente el criterio; mantener no_evaluado para proposiciones de negocio no verificables y cubrir negación/no-hallazgos en backend/src/modules/reports/report.service.ts y backend/tests/convergence.test.ts per FR-014 y Constitution III (contradicts).
- [X] T018 [US1] Permitir propuesta y aceptación explícita de ampliación de bolsas propias con nueva versión/digest de política, sin cambiar entrada/precio/alcance ni plazos, conservando reservas/consumos y snapshot original en backend/src/modules/jobs/job.service.ts, backend/src/modules/jobs/job.controller.ts, backend/src/modules/budgets/budget.service.ts y packages/api-contracts/src/index.ts per FR-003 y US1/AC2 (partial).
- [X] T019 [US1] Añadir revisar/aceptar ampliación con límites exactos y autorización inicialmente sin marcar en frontend/src/modules/budgets/BudgetPage.tsx y contrato docs/local-api-contract.md; mostrar que no prolonga plazo ni usa precio retenido, con integración backend en backend/tests/convergence.test.ts per FR-003 y US1/AC2 (missing).

## Evidencia de cierre

Implementación verificada el 2026-10-12: build aprobado, 17 pruebas de backend y 6 E2E.
[Informe de validación y límites](../../docs/local-acceptance-report.md).
Dockerfiles y Compose preparados; arranque de contenedores pendiente por ausencia de Docker.
