# Flujo Spec Kit del prototipo local

Fecha:2026-10-12. Índice de artefactos y decisiones, no acta de aprobación del producto completo ERS.

## Índice

| Módulo | Especificación | Plan | Backlog local |
| --- | --- | --- | --- |
| Base local | [001 spec](../specs/001-base-local/spec.md) | [001 plan](../specs/001-base-local/plan.md) | [001 tasks](../specs/001-base-local/tasks.md) |
| Catálogo/ofertas | [002 spec](../specs/002-catalogo-ofertas/spec.md) | [002 plan](../specs/002-catalogo-ofertas/plan.md) | [002 tasks](../specs/002-catalogo-ofertas/tasks.md) |
| Contratación/revisión | [003 spec](../specs/003-contratacion-revision/spec.md) | [003 plan](../specs/003-contratacion-revision/plan.md) | [003 tasks](../specs/003-contratacion-revision/tasks.md) |
| Cierre/operación | [004 spec](../specs/004-cierre-operacion/spec.md) | [004 plan](../specs/004-cierre-operacion/plan.md) | [004 tasks](../specs/004-cierre-operacion/tasks.md) |

Cada carpeta incluye research, data-model, contracts/api, quickstart y checklists.
Gobierno: [constitution](../.specify/memory/constitution.md), [reglamentario](../reglamentario.md).
Contratos: [API local](local-api-contract.md), packages/api-contracts/src/index.ts.
Revisión: [análisis y convergencia](specification-analysis.md).
Diseño/research: [frontend](frontend-local-design.md), [backend](backend-local-research.md).

## Secuencia y alcance

Se usaron skills del repositorio .agents/skills: constitution, specify por feature,
clarify con decisiones delegadas, plan, tasks, checklist y analyze readonly. Helpers de
plantillas y prerequisites se ejecutaron por feature con SPECIFY_FEATURE_DIRECTORY explícito.
Implement corresponde al orquestador/agentes fuente; converge agregó sólo brechas trazables.
Checklists custom revisados por reviewer autorizado: marcan requisitos claros, no código completo.

Baseline no aplicó: al inicio no existía fuente de aplicación autorizada para analizar;
los documentos históricos no equivalen a código. No se inventó una baseline desde backups.
Taskstoissues no publicó GitHub: el usuario pidió sólo local. tasks.md constituye el backlog
local ordenado y trazable; ninguna issue remota fue creada.

## Fuentes y precedencia

ERS DOCX vigente Exportación en Documentos/Ingenieria de Requerimientos:18RU/44RS/12CU/33PR.
Figma local06/07/09 cubre marketplace reciente. Documentación10-10 describe fase histórica.
Instrucción actual prevalece: exclusivamente local, sin login/claves/dominio, Compose directo,
monorepo frontend/backend modular con DTO/controller, análisis determinista real de texto,
financiación/escrow/compras simuladas. No se editaron Word ni Figma remoto en este flujo.

## Estado y evidencia

Los artefactos y las 52 tareas de implementación están completos. Se aprobaron el build,
17 pruebas de backend con SQLite real y 6 recorridos E2E en Edge. Se comprobó el arranque
con `npm run dev`, el proxy API, el cierre de procesos y el reflujo móvil, y se inspeccionaron
capturas de pantalla. La evidencia y sus límites están en
[el informe de validación local](local-acceptance-report.md).

Docker ausente deja el arranque real de Compose pendiente. La tarea de crear sus archivos
está realizada; no se declara una prueba de contenedores que no se ejecutó.
No existe `.specify/extensions.yml`, por lo que no había hooks posteriores que ejecutar.

Esta entrega no aprueba inferencia remota, wallet/contratos/x402 reales, PostgreSQL multiworker,
S3, Redis, correo, despliegue público ni evaluación humana de perfiles. PR32 Redis no aplicable.
Los recorridos locales de12CU y sus invariantes sí forman parte de las specs actuales.
