# Implementation Plan: Base local

**Branch**: feature_directory `001-base-local` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)
**Input**: specs/001-base-local/spec.md

## Summary

Crear workspaces frontend/backend/contracts, API local con actores por petición y SQLite
persistente. Compose sirve frontend en localhost y API detrás de proxy sin configuración externa.

## Technical Context

**Language/Version**: Node 24.18.0, npm 11, TypeScript 7.0.2.
**Primary Dependencies**: React 19.3, Vite 8.3.4, Express 5.3, Zod 4.6.6; lock exacto.
**Storage**: node:sqlite, SQLite 3.53.1 verificado por orquestador; volumen Docker /data.
**Testing**: node:test con SQLite real; TypeScript/build; E2E navegador del orquestador.
**Target Platform**: localhost Windows de desarrollo y contenedores Linux.
**Project Type**: monorepo web/API.
**Performance Goals**: navegación y mutaciones locales sin esperas de servicios remotos.
**Constraints**: sin auth/claves/dominio, una instancia, sin Redis/PostgreSQL/S3.
**Scale/Scope**: cuatro actores demo, cupo posterior de diez trabajos.

## Constitution Check

Pre-research PASS: cinco principios satisfechos. Post-design PASS: contratos públicos sin IO,
actores por petición, almacenamiento local y todas las dependencias contribuyen al demo.
Sin excepciones ni gate pendiente. Docker ausente en entorno actual: arranque real deberá
registrarse pendiente, nunca aprobado por mera validación del YAML.

## Project Structure

### Documentation (this feature)

spec.md, plan.md, research.md, data-model.md, contracts/api.md, quickstart.md, tasks.md.

### Source Code (repository root)

```text
frontend/src/app/
frontend/src/shared/
frontend/src/modules/
backend/src/app/
backend/src/shared/database/
backend/src/modules/context/
packages/api-contracts/src/
tests/e2e/
docker-compose.yml
```

**Structure Decision**: aplicaciones independientes por features, contratos portables;
controllers/DTO/services permanecen en módulos backend. Root gestiona lock y Compose.

## Complexity Tracking

Sin violaciones. SQLite incorporado elimina addon nativo y servicios extra.
