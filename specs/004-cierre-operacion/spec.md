# Feature Specification: Cierre, disputas y operación

**Feature Branch**: feature_directory `004-cierre-operacion`, sin rama propia.
**Created**: 2026-10-12
**Status**: Implementado y verificado localmente; límites en [informe](../../docs/local-acceptance-report.md).
**Input**: Aceptar entrega, disputar/responder/arbitrar, reclamar plazos, ventas, avisos, preferencias y control local.

## Clarifications

### Session 2026-10-12

- Q: ¿Cómo se prueban los plazos sin esperar días? → A: Reloj controlado en pruebas, fechas absolutas conservadas en aplicación.
- Q: ¿Puede arbitraje repartir parcialmente? → A: Sólo pago total o devolución total, una salida única.
- Q: ¿Quién resuelve disputa? → A: Árbitro demo asignado e independiente de comprador/proveedor.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Decidir y cerrar entrega (Priority: P1)

Comprador consulta informe y acepta o abre disputa con motivo/evidencia mínima.
**Why this priority**: Completa el compromiso comercial sin confundir gasto con precio.
**Independent Test**: Fixture entregado permite aceptación; otra orden permite disputa.
**Acceptance Scenarios**:

1. **Given** entrega disponible sin disputa antes de48h, **When** acepta, **Then** precio demo se paga una sola vez.
2. **Given** ejecución o entrega disputable, **When** disputa con motivo, **Then** retiene precio y detiene nuevo despacho.

### User Story 2 - Responder, arbitrar y reclamar (Priority: P2)

Proveedor responde o renuncia; árbitro independiente resuelve; partes reclaman vencimientos.
**Why this priority**: Completa alternativas de cierre y protege coherencia de fondos demo.
**Independent Test**: Disputa seeded con reloj controlado y actores definidos.
**Acceptance Scenarios**:

1. **Given** disputa abierta, **When** proveedor responde, **Then** conserva motivo/evidencia/respuesta sin exponer archivos privados.
2. **Given** árbitro asignado antes de7d, **When** resuelve, **Then** pago o devolución total únicos con motivo.
3. **Given** disputa sin resolver desde7d, **When** parte reclama, **Then** procede devolución.
4. **Given** entrega sin disputa desde48h, **When** parte reclama, **Then** procede pago.

### User Story 3 - Operar y mantenerse informado (Priority: P3)

Proveedor ve ventas; actores ven avisos/preferencias; admin pausa admisión/gasto con motivo.
**Why this priority**: Permite observar y administrar demo sin cambiar compromisos ajenos.
**Independent Test**: Actividad seeded produce paneles y control operativos propios.
**Acceptance Scenarios**:

1. **Given** ventas de distintos proveedores, **When** consulta, **Then** sólo ve propias y totales separados por moneda.
2. **Given** notificación propia, **When** marca leída, **Then** no cambia ejecución ni dinero.
3. **Given** admin pausa con motivo, **When** intenta admitir o gastar, **Then** bloquea nuevas acciones y permite cierre/reclamación existente.

### Edge Cases

- Árbitro parte de orden, no asignado, evidencia posterior al cierre y doble cierre se rechazan.
- Desde30min sin inicio o15min sin entrega se permite reclamar devolución; reinicio no renueva plazo.
- Límite exacto favorece reclamación por vencimiento; acción original requiere fecha anterior.
- Devolver precio no devuelve gastos consumidos; proveedor no recibe archivos privados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: DEBE aceptar entrega sólo comprador, antes de48h, sin disputa ni cierre previo; paga precio total demo.
- **FR-002**: DEBE disputar ejecución/entrega antes del vencimiento con motivo/evidencia mínima; retiene precio y detiene despacho.
- **FR-003**: Proveedor DEBE responder o renunciar antes de cierre; renuncia devuelve precio total.
- **FR-004**: Sólo árbitro asignado independiente DEBE resolver antes de7d con motivo, pago total o devolución total.
- **FR-005**: DEBE implementar reclamaciones T2/T4/T6/T10: sin inicio30min, sin entrega15min, silencio48h, disputa7d sin resolver.
- **FR-006**: DEBE conservar timestamps absolutos al reiniciar y permitir reclamación desde límite exacto.
- **FR-007**: DEBE cerrar idempotentemente una única salida total al destino fijado, conservando gastos y reservas independientes.
- **FR-008**: Proveedor DEBE ver ventas/órdenes propias y evidencia mínima de disputa sin código privado.
- **FR-009**: Actores DEBEN consultar/marcar avisos propios y guardar zona/preferencias sin modificar dinero.
- **FR-010**: Admin DEBE consultar operación y pausar/reanudar admisión/nuevo gasto con motivo auditado; no ampliar presupuesto ajeno ni editar cargos.
- **FR-011**: DEBE mostrar estados y efectos de cierre claramente como simulados, con confirmaciones antes de aceptar/renunciar/resolver.
- **FR-012**: DEBE permitir archivar/reabrir vista de encargo terminal y retirar contenido detenido sin borrar contabilidad ni evidencia necesaria de disputa.

### Key Entities *(include if feature involves data)*

- **Disputa**: orden, motivo, evidencia mínima, respuesta, árbitro y resolución única.
- **Cierre**: identidad idempotente, resultado total y destinatario fijo, timestamp/motivo.
- **Aviso/preferencia**: actor propietario, origen, leído y configuración.
- **Control operativo**: flags admisión/gasto, actor admin, motivo y evento auditado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las diez transiciones de garantía demo tienen salida verificable con reloj controlado.
- **SC-002**: Todos los cierres repetidos o contradictorios del ensayo conservan una sola salida total.
- **SC-003**: Todos los intentos de arbitraje ajeno o con conflicto del ensayo son rechazados.
- **SC-004**: Avisos/preferencias no cambian ninguna bolsa ni estado contractual del ensayo.
- **SC-005**: Pausa bloquea nuevo consumo y mantiene disponibles consultas/cierres existentes.

## Assumptions

- Depende de001 actores y003 órdenes/informe; sin blockchain, correo o invitaciones reales.
- Plazos de ERS/Figma adoptados como valores demo:30min/15min/10min/48h/7d, no garantía comercial.
- Fuentes: ERS CU08/10/11/12, RS08/14/16/17/18/23/25/29/35, PR08/15/17/18/19/23; Figma07/09.
