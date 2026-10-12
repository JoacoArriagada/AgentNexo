# Research: Cierre

- Decision: total pay/refund único, sin parcial. Rationale: ERS/Figma T8 y coherencia de garantía. Alternatives considered: reparto parcial, excluido.
- Decision: instante exacto permite claim; acción original sólo antes. Rationale: elimina ambigüedad de frontera. Fuente docs/local-api-contract.md.
- Decision: Date UTC durable y reloj inyectado en tests. Rationale: comprobar48h/7d sin dormir ni renovar tras reinicio. Alternatives considered: timers RAM.
- Decision: árbitro asignado independiente; proveedor sólo metadatos/evidencia mínima. Rationale: conflicto y privacidad del escenario sin auth pública.
- Decision: control operativo con motivo y flags admisión/gasto, no edición de cargos. Fuente docs/backend-local-research.md y Figma07/09.
