# Servicios de demostración (pendientes)

Dos endpoints HTTP con destinatarios separados: A calcula métricas para el ejemplo soportado; B ofrece casos de prueba parametrizados sin ejecutarlos. Deben responder mediante x402 compatible. No representan acuerdos con proveedores comerciales.

Unidad futura de servicios de demostración, sin manifiesto ni workspace instalado. Un proceso Express futuro separado del backend, con rutas `POST /v1/static-analysis` y `POST /v1/test-catalogue`, fixtures públicos, validación de entrada y recuperación idempotente de una entrega pagada. No importa la base ni el firmante del backend.

[Contrato A/B](../docs/backend-and-agents.md), [pago y recuperación](../docs/payments-and-budget.md). No hay comandos, servidor ni adaptador x402 implementados; este directorio conserva solo requisitos.
