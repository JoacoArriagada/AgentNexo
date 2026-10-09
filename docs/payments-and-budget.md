# Pagos y presupuesto

**Estado:** política propuesta. No hay pagos, contrato ni firmante implementados.

## Presupuesto por categorías

Un trabajo guarda topes independientes por moneda/categoría: modelos por APIs tradicionales (USD), compras x402 a proveedores (token Testnet) y comisiones de red (XLM). La comisión de AgentNexo es cero en la demostración. No se suman activos de prueba y dinero real como un único saldo.

Cada petición valida el presupuesto global, el cupo del agente, el proveedor y el máximo por operación. Fórmula por categoría: `disponible = autorizado − confirmado − reservado`. Cupos por agente son límites adicionales, no dinero nuevo. Usa decimales exactos/unidades mínimas y los decimales comprobados del activo.

El PaymentBroker hace una reserva atómica y con identidad idempotente antes de permitir la firma. La propuesta inicial usa una transacción SQLite de escritura breve y unicidad por operación lógica. Un bloqueo causa reintento acotado o rechazo. La llamada HTTP o blockchain ocurre fuera de esa transacción.

Estados mínimos: solicitada, rechazada, reservada, enviada, confirmada, fallida o incierta. Ante timeout o respuesta incierta, conserva la reserva hasta reconciliar operación y autorización; no repitas el pago con una identidad nueva. Un pago confirmado con fallo de entrega permanece como gasto confirmado. El informe distingue estimaciones, reservas, confirmados y disponibles.

## x402 y Stellar

El quickstart de Stellar documenta paquetes x402 v2 y un facilitator de ejemplo. La especificación `exact` para Stellar construye una invocación SEP-41 `transfer(from,to,amount)` y firma entradas de autorización; el facilitator verifica y presenta la liquidación patrocinada. Comprueba red, token, cantidad, destinatario, vencimiento y firmantes.

Un contrato que escribe un contador después de una transferencia no impide un gasto. Una allowance de `transfer_from` no se aplica automáticamente a un flujo `transfer`. Una cuenta contractual con política en `__check_auth` es una opción por probar, no una garantía de que el flujo x402 y el facilitator soporten esa autorización. Exige prueba de compra permitida, exceso, destinatario no permitido, vencimiento, concurrencia y rutas de evasión bajo la misma autoridad.

El facilitator candidato publicado por el quickstart anuncia `stellar:testnet` y x402 v2/`exact` en `/supported`; falta probar `/verify` y `/settle` con el firmante y el contrato escogidos. Si la política no encaja, la demo puede usar una cuenta G de Testnet firmada por el broker y declarar que los límites dependen del backend. No se atribuye entonces control contractual.

USDC de Testnet queda condicionado a verificar emisor, contrato SAC, decimales, trustline y soporte del facilitator. Friendbot proporciona XLM de Testnet; USDC se obtiene por separado. Ningún token de Testnet tiene valor real. Informa quién patrocina o paga comisiones y separa costes de despliegue/mantenimiento.

## Modelos

Las APIs de modelos tradicionales no pasan por x402 de forma automática. El backend necesita topes de llamadas y tokens, duración/reintentos, reserva conservadora basada en precios vigentes y conciliación del consumo reportado. El usuario configura una ampliación; ni modelo ni agente pueden aumentar su cuota. Si no existe una cota suficiente del costo, no iniciar la llamada.

Referencias: [x402 quickstart de Stellar](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide), [esquema exact en Stellar](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_stellar.md), [patrones de cuenta contractual](https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns).
