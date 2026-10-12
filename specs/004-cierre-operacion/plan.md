# Implementation Plan: Cierre y operación

**Branch**: feature_directory `004-cierre-operacion` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)
**Input**: specs/004-cierre-operacion/spec.md

## Summary

Extender máquina de órdenes con T1–T10, disputa/respuesta/arbitraje, plazos y cierre total
idempotente. Añadir panel ventas, notificaciones/preferencias y operación local auditada.

## Technical Context

**Language/Version**: Node24.18/TS7.0.2/npm11.
**Primary Dependencies**: mismas de001; sin SDK financiero ni correo.
**Storage**: node:sqlite; transacciones cortas para transición/cierre/eventos.
**Testing**: node:test con SQLite y reloj inyectado; E2E aceptación/disputa/arbitraje.
**Target Platform**: localhost desktop/mobile.
**Project Type**: módulos de dominio backend y UI por features.
**Performance Goals**: cierre determinista local sin espera de ledger externo.
**Constraints**: total pay/refund, nunca reparto parcial; árbitro independiente; sin auth real.
**Scale/Scope**: diez trabajos y actores demo; plazos absolutos48h/7d, prueba sin esperar días.

## Constitution Check

Pre-research PASS; post-design PASS. Autoridad en backend, identidad durable, gastos
separados del precio y rotulación de simulación. Controles administrativos proporcionales.

## Project Structure

### Documentation (this feature)

spec.md, research.md, data-model.md, contracts/api.md, quickstart.md, tasks.md.

### Source Code (repository root)

```text
backend/src/modules/orders/
backend/src/modules/notifications/
backend/src/modules/operations/
frontend/src/modules/jobs/
frontend/src/modules/sales/
frontend/src/modules/operations/
frontend/src/modules/notifications/
frontend/src/modules/settings/
backend/tests/closure.test.ts
```

**Structure Decision**: cierre sigue propiedad de orders; no nuevo microservicio escrow.
Notifications y operations consumen eventos/metadatos; no pueden cambiar dinero ajeno.

## Complexity Tracking

Sin violaciones. Reloj inyectable es frontera de prueba, no configuración que altere plazos reales.
