# Feature Specification: Catálogo y ofertas versionadas

**Feature Branch**: feature_directory `002-catalogo-ofertas`, sin rama propia.
**Created**: 2026-10-12
**Status**: Implementado y verificado localmente; límites en [informe](../../docs/local-acceptance-report.md).
**Input**: Explorar, publicar, versionar y moderar ofertas del marketplace de demostración local.

## Clarifications

### Session 2026-10-12

- Q: ¿Qué perfiles pueden contratarse? → A: reviewer local; two-role-demo rotulado experimental con fixture público.
- Q: ¿La retirada cambia órdenes existentes? → A: Bloquea nuevas ventas; snapshots contratados permanecen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Encontrar una revisión (Priority: P1)

Visitante explora ofertas aprobadas, filtra y consulta precio, perfil, límites y proveedor.
**Why this priority**: Identifica qué se está contratando.
**Independent Test**: Consultar catálogo seeded como visitante y comprobar ficha.
**Acceptance Scenarios**:

1. **Given** ofertas en varios estados, **When** visita catálogo, **Then** sólo ve las aprobadas.
2. **Given** filtro sin coincidencias, **When** busca, **Then** ve vacío y puede limpiar filtro.

### User Story 2 - Publicar y actualizar oferta (Priority: P2)

Proveedor guarda borrador, envía a revisión y genera nuevas versiones.
**Why this priority**: Alimenta catálogo conservando historial comercial.
**Independent Test**: Guardar oferta y actualizarla sin tocar snapshot de una orden previa.
**Acceptance Scenarios**:

1. **Given** campos válidos, **When** guarda/envía, **Then** pasa de borrador a pendiente.
2. **Given** oferta contratada, **When** cambia precio, **Then** la orden conserva la versión original.

### User Story 3 - Moderar sin conflicto (Priority: P3)

Administrador aprueba, rechaza o suspende con motivo y actor registrado.
**Why this priority**: Hace explícita la disponibilidad de nuevas contrataciones.
**Independent Test**: Moderar pendiente y comprobar visibilidad en catálogo.
**Acceptance Scenarios**:

1. **Given** oferta pendiente de otro actor, **When** aprueba con motivo, **Then** puede contratarse.
2. **Given** moderador propietario, **When** intenta aprobar, **Then** se bloquea autoaprobación.

### Edge Cases

- Datos vacíos, precio negativo o formato fraccionario rechazados sin guardar.
- Edición obsoleta rechazada sin pisar versión nueva.
- Oferta suspendida no admite órdenes nuevas ni invalida órdenes financiadas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: DEBE consultar catálogo por búsqueda y perfil, mostrando aprobadas al visitante.
- **FR-002**: DEBE mostrar ficha con versión, proveedor, perfil, límites y precio con moneda demo.
- **FR-003**: Proveedor DEBE crear/editar sus ofertas; nombre 3–100 caracteres y descripción 20–2000.
- **FR-004**: Precio DEBE ser importe entero positivo en unidad mínima de demostración.
- **FR-005**: DEBE conservar versiones históricas y bloquear actualización obsoleta.
- **FR-006**: DEBE enviar borrador a moderación y registrar decisión/motivo/actor/fecha.
- **FR-007**: Administrador DEBE aprobar/rechazar/suspender sin autoaprobación.
- **FR-008**: Nueva versión no aprobada DEBE quedar fuera de nuevas contrataciones.
- **FR-009**: Retirada/suspensión DEBE preservar snapshots y cierre de órdenes existentes.

### Key Entities *(include if feature involves data)*

- **Oferta**: ID estable, propietario, estado y versión actual.
- **Versión**: nombre, descripción, perfil, precio y timestamp inmutables al contratar.
- **Moderación**: versión decidida, actor independiente, decisión y motivo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Catálogo público no revela ninguna oferta no aprobada.
- **SC-002**: Cada actualización conserva el precio y perfil originales de órdenes ya creadas.
- **SC-003**: Publicación/rechazo/suspensión se pueden completar y verificar por actores demo.
- **SC-004**: Todos los intentos de autoaprobación y edición obsoleta del ensayo se rechazan.

## Assumptions

- Depende de 001 actores y almacenamiento; contratación consume versión en 003.
- Moderación evalúa datos demo, no una certificación del modelo o proveedor real.
- Fuentes: ERS RU01/03/04/11, CU01/03/04, RS02/03/04/17, PR02/03/04; Figma06/09.
