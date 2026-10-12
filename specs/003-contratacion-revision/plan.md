# Implementation Plan: Contratación y revisión

**Branch**: feature_directory `003-contratacion-revision` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)
**Input**: specs/003-contratacion-revision/spec.md

## Summary

Implementar jobs/policies/orders/execution/budgets/reports con transacciones SQLite,
analizador de reglas real y adaptadores A/B/financiación demo. UI crea política y orden,
inicia, sigue actividad y entrega informe exportable. Backend conserva autoridad.

## Technical Context

**Language/Version**: Node24.18/TypeScript7.0.2/npm11.
**Primary Dependencies**: Express5.3/Zod4.6.6, React19.3/Vite8.3.4; mismas de001.
**Storage**: node:sqlite con FK/WAL, INTEGER/bigint; archivos de texto en datos locales.
**Testing**: node:test integración SQLite de estados/dinero; E2E contratación→informe.
**Target Platform**: localhost, una instancia API y despachador.
**Project Type**: backend modular y frontend por funcionalidades.
**Performance Goals**: análisis acotado hasta1000 líneas; sin espera externa real.
**Constraints**: no ejecución de entrada ni IA/pagos externos; clocks absolutos y simulación explícita.
**Scale/Scope**: diez trabajos admitidos, dos tareas activas globales/dos por job.

## Constitution Check

Pre-research PASS y post-design PASS. Entrada real estática, simulaciones identificadas,
cuatro bolsas exactas, snapshots/identidad durables y modularidad sin workers distribuidos.
No excepción: checkpoints locales resuelven reinicio sin añadir bus o cola externa.

## Project Structure

### Documentation (this feature)

spec.md, research.md, data-model.md, contracts/api.md, quickstart.md, tasks.md.

### Source Code (repository root)

```text
backend/src/modules/jobs/
backend/src/modules/orders/
backend/src/modules/execution/
backend/src/modules/budgets/
backend/src/modules/providers/
backend/src/modules/reports/
frontend/src/modules/jobs/
frontend/src/modules/reports/
frontend/src/modules/budgets/
packages/api-contracts/src/
backend/tests/reviews.test.ts
```

**Structure Decision**: controllers/dto/services/repositories según frontera real. Composición
app conecta snapshots; reports no importa coordinador y presupuestos no dependen de UI.

## Complexity Tracking

Sin violaciones; analizador determinista local es deliberado por alcance sin credenciales.
