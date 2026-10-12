# Implementation Plan: Catálogo y ofertas

**Branch**: feature_directory `002-catalogo-ofertas` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)
**Input**: specs/002-catalogo-ofertas/spec.md

## Summary

Implementar catálogo público y módulo offers con controller/DTO/service/repository,
versiones persistentes y moderation para admin demo independiente.

## Technical Context

**Language/Version**: Node24.18/TypeScript7.0.2; npm11.
**Primary Dependencies**: Express5.3/Zod4.6.6, React19.3/Vite8.3.4; hereda lock001.
**Storage**: SQLite incorporado, offers y versiones/snapshots de órdenes.
**Testing**: node:test integración SQLite; E2E de catálogo→publicación→moderación.
**Target Platform**: localhost web desktop/mobile.
**Project Type**: módulos frontend/backend del monorepo.
**Performance Goals**: filtro local responde sin dependencia externa.
**Constraints**: no autenticación ni verificación externa del proveedor.
**Scale/Scope**: fixtures pequeños, tres estados de decisión, dos perfiles demo.

## Constitution Check

Pre-research PASS; post-design PASS. Local, DTO compartido, separación de aplicación,
versiones/actores coherentes y complejidad acotada. No excepción.

## Project Structure

### Documentation (this feature)

spec.md, research.md, data-model.md, contracts/api.md, quickstart.md, tasks.md.

### Source Code (repository root)

```text
backend/src/modules/offers/{dto,controllers,services,repositories}/
frontend/src/modules/catalog/
frontend/src/modules/offers/
frontend/src/modules/moderation/
packages/api-contracts/src/
backend/tests/offers.test.ts
```

**Structure Decision**: catálogo/publicación/moderación comparten propiedad oferta; backend
puede mantener un módulo offers con rutas de moderación para evitar capas duplicadas.

## Complexity Tracking

Sin violaciones; snapshot contratado evita dependencia de versión mutable.
