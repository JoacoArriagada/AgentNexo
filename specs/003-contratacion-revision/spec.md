# Feature Specification: Contratación y revisión local

**Feature Branch**: feature_directory `003-contratacion-revision`, sin rama propia.
**Created**: 2026-10-12
**Status**: Implementado y verificado localmente; límites en [informe](../../docs/local-acceptance-report.md).
**Input**: Encargo, política aceptada, orden financiada demo, ejecución estática, presupuesto e informe.

## Clarifications

### Session 2026-10-12

- Q: ¿Análisis y pagos requieren servicios reales? → A: Análisis determinista de entrada real, pagos y garantía locales simulados.
- Q: ¿Qué herramientas pueden usarse con archivos propios? → A: Ninguna A/B; sólo fixture público DEMO-01 explícito permite esas herramientas.
- Q: ¿Cómo se separan los importes? → A: Precio, modelos, herramientas y comisiones son cuatro bolsas independientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Definir y autorizar encargo (Priority: P1)

Comprador elige oferta aprobada y define entrada, objetivo, criterios y límites.
**Why this priority**: Congela lo contratado antes de cualquier consumo.
**Independent Test**: Guardar encargo válido y aceptar política; editar invalida aceptación.
**Acceptance Scenarios**:

1. **Given** entrada válida, **When** acepta política visible, **Then** queda registrada su versión y digest.
2. **Given** política aceptada, **When** modifica archivo/objetivo/límite, **Then** requiere aceptación nueva.

### User Story 2 - Contratar y financiar demo (Priority: P2)

Comprador confirma términos y reserva precio de demostración para una orden.
**Why this priority**: Vincula oferta, política y partes de manera trazable.
**Independent Test**: Crear/financiar orden sin iniciar análisis y repetir petición sin duplicado.
**Acceptance Scenarios**:

1. **Given** oferta vigente y política aceptada, **When** contrata/financia, **Then** conserva snapshots y garantía demo.
2. **Given** capacidad llena, **When** contrata, **Then** rechaza antes de financiar.

### User Story 3 - Ejecutar y revisar resultados (Priority: P3)

Comprador inicia revisión, sigue actividad/gastos y consulta informe con evidencia real.
**Why this priority**: Entrega el valor principal del producto.
**Independent Test**: Ejecutar fixture con defecto conocido y validar cita de archivo/línea.
**Acceptance Scenarios**:

1. **Given** orden financiada, **When** inicia dos veces, **Then** ejecuta una única revisión y no duplica cargos.
2. **Given** archivos propios, **When** analiza, **Then** no compra A/B y cita sólo esa entrada.
3. **Given** revisión en curso, **When** cancela, **Then** no inicia nuevas tareas y conserva efectos confirmados.
4. **Given** resultado parcial, **When** abre informe, **Then** identifica contribuciones ausentes y casos sin ejecutar.

### Edge Cases

- 0/4 archivos, extensión inválida, UTF-8 inválido, 1001 líneas o 262145 bytes rechazados.
- Precio retenido nunca paga herramientas; dos reservas 0,03 con tope 0,05 tienen una ganadora.
- Respuesta perdida/operación incierta conserva identidad y reserva hasta conciliación.
- Reinicio no duplica ejecución ni compras; tiempo absoluto no se reinicia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: DEBE permitir crear/editar/eliminar borrador propio sin compromisos; archivar no borra contabilidad.
- **FR-002**: DEBE validar título 3–100, objetivo 20–2000, 1–10 criterios de hasta 500 y 1–3 .js/.ts UTF-8, 1000 líneas/262144 bytes combinados.
- **FR-003**: DEBE congelar entrada y política aceptada con versión/digest; edición invalida aceptación.
- **FR-004**: DEBE crear orden con snapshots oferta/política, comprador/proveedor/árbitro independiente y precio demo.
- **FR-005**: DEBE reservar admisión antes de financiación; máximo diez trabajos admitidos, sin cobrar al rechazado.
- **FR-006**: DEBE financiar/iniciar idempotentemente sin claves, wallet ni conexiones externas.
- **FR-007**: DEBE analizar entrada estáticamente sin ejecutar, con coordinador determinista, máximo dos tareas por trabajo/dos activas globales, cuatro llamadas por tarea y un reintento, diez minutos absolutos.
- **FR-008**: DEBE limitar A/B al fixture público admitido y perfil two-role-demo; archivos propios no habilitan compras.
- **FR-009**: DEBE mostrar cuatro bolsas exactas independientes, reservas, confirmado, disponible y déficit, sin sumar monedas.
- **FR-010**: DEBE rechazar exceso antes de reservar/consumir; reintentos no duplican operación, incertidumbre no libera reserva automáticamente.
- **FR-011**: DEBE separar estado de ejecución/entrega/financiación/garantía y registrar actividad ordenada.
- **FR-012**: DEBE cancelar nuevo despacho sin revertir cargos confirmados ni ocultar reservas.
- **FR-013**: DEBE producir informe completo/parcial con hallazgos de líneas existentes, evidencia, severidad, incertidumbre, recomendación y casos ejecutados=false.
- **FR-014**: DEBE indicar criterios sustentado/no_sustentado/no_evaluado y exportar Markdown/JSON de la misma versión.
- **FR-015**: DEBE recuperar tareas/operaciones locales tras reinicio por identidad sin nuevo cobro.

### Key Entities *(include if feature involves data)*

- **Encargo/archivo**: propietario, objetivo, criterios, entrada y digest/versiones.
- **Política/aceptación**: límites, perfil, contexto público/privado y snapshot aceptado.
- **Orden/garantía**: partes, snapshots, financiación, precio retenido y plazos.
- **Tarea/operación**: identidad, estado, reserva, consumo, entrega y checkpoints.
- **Informe**: versión de entrada, hallazgos, casos, criterios, limitaciones y contribuciones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un comprador completa encargo→aceptación→financiación→informe sin credenciales.
- **SC-002**: Todas las citas publicadas apuntan a archivos y líneas existentes de la entrada.
- **SC-003**: Repetir inicio/financiación/reintento no produce cargos ni órdenes duplicados.
- **SC-004**: Todas las entradas sobre límite del ensayo se rechazan antes de consumo.
- **SC-005**: Cancelación y reinicio conservan estado y presupuesto sin nuevos efectos indebidos.

## Assumptions

- Depende 001 y 002; aceptación/disputa/cierre se implementan en004.
- Análisis por reglas demuestra funcionalidad local, no precisión de IA ni evaluación de perfiles ERS.
- Valores iniciales demo: modelos 1 USD, herramientas privadas 0, DEMO-01 0,06 USDC, comisiones0,10 XLM; no son tarifas reales.
- Fuentes: ERS CU05–10, RS05–15/20/22/35/39/44, PR05–16/20/33; Figma06/09. Infraestructura remota sustituida por instrucción local.
