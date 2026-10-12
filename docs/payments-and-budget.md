# Pagos, presupuesto y autorización

**Estado:** especificación para implementar; no hay firmante, contrato, compra ni liquidación ejecutados. Investigación actualizada el **09-10-2026** mediante documentación, registros de paquetes y consultas públicas de solo lectura. La migración del repositorio no convierte esta integración en funcional.

## Decisiones y límites

| Decisión | Estado y motivo |
| --- | --- |
| Stellar Testnet y x402 v2 `exact` | Confirmada como integración objetivo. Dos proveedores HTTP demostrativos, destinatarios distintos y ningún pago real. |
| `PaymentBroker` dentro de `apps/backend` | Confirmada. Autoriza reservas y solicita firmas; coordinador y modelos proponen operaciones estructuradas. |
| SQLite y un backend | Confirmada para la demo. Los saldos se comprueban dentro de una misma transacción breve; HTTP y blockchain ocurren fuera de ella. |
| Cuenta contractual C por trabajo | Extensión condicional. Aloja fondos y política; falta demostrar su integración con SDK y facilitator. No bloquea P1 ni el mínimo P2. |
| Cuenta G dedicada y prefinanciada | Base válida del mínimo Testnet, sin exigir primero implementar C. Se presenta como **control de presupuesto en aplicación**: su clave permite eludir los límites. |
| Modelos por API tradicional | Categoría separada; consumo y facturación controlados por backend, independientemente de Soroban. |

El broker depende de políticas autorizadas, persistencia y adaptadores; no de instrucciones del modelo. `contracts/` contiene la futura prueba Soroban y `demo-services/` los proveedores A/B. No se añaden tesorería general, transferencias entre agentes, token propio ni facilitator propio.

## Identidad, autorización, custodia y firma

La sesión de aplicación identifica al responsable y determina sus trabajos. Conectar Freighter expone una dirección y una red; no autentica la sesión ni autoriza compras. Una vinculación de wallet requiere prueba de posesión mediante desafío de un solo uso, dominio, red, vencimiento y verificación backend. Esa prueba no sustituye la autorización de cada política.

En una implementación futura, antes de iniciar se persistirá una versión inmutable de política: propietario, trabajo, objetivo, entradas autorizadas, modo single-pass/two-role, conjunto fijo de roles, vencimiento, categorías monetarias, cupos por rol, máximo por operación y proveedores/herramientas permitidos. Single-pass no habilita compras A/B. Por proveedor fija URL canónica y método, destinatario, red, contrato del activo y precio máximo. El responsable autoriza explícitamente esa versión. Cambiar importe, destinatario, modo o alcance requiere una versión nueva autorizada; HTTP 402 solo ofrece condiciones.

| Modo | Fondos y autoridad | Autorización inicial | Operación automática |
| --- | --- | --- | --- |
| Cuenta C, pendiente de viabilidad | Saldo del token asociado al contrato. El propietario administra/recupera según contrato; backend custodia claves de sesión acotadas. | El usuario configura y financia la cuenta y firma la delegación/política mediante wallet, comprobando lo firmado. | Backend firma autorizaciones delegadas; `__check_auth` controla la liquidación. Facilitator firma y envía la transacción exterior. |
| Cuenta G, alternativa | Cuenta separada por trabajo, con fondos de prueba limitados; plataforma custodia su clave y controla esos fondos. | Autorización del trabajo en aplicación. No se exporta la wallet personal; cualquier aportación opcional de prueba se firma manualmente. | Broker valida y firmante backend firma. No hay garantía contractual ni reposición automática de saldo. |

Los agentes nunca reciben claves ni acceso al firmante. Freighter se reserva para el usuario; las compras autónomas no requieren automatizar la extensión ni pedir cada firma manualmente. Los poderes del propietario para actualizar contrato o retirar fondos deben declararse aparte. Una delegación limitada no elimina esos poderes.

## Contabilidad y reservas

Se mantienen bolsas independientes. Estándar privado: modelo 1,00 USD; compras USDC y red XLM externas no autorizadas, con límite cero. DEMO-01 público de pricing.ts fijo: modelo 1,00 USD, compras 0,06 USDC Testnet y red 0,10 XLM Testnet, con autorización específica. El ensayo futuro PAY-01 puede usar 0,05 bajo una política separada; no es el límite del trabajo privado. Comisión AgentNexo 0. Son topes ilustrativos, no tarifas. Preparación de cuentas, trustlines y mantenimiento contractual se presupuestan aparte. El balance on-chain prueba fondos, pero no sustituye el presupuesto aprobado ni concede permiso para gastarlo.

Por bolsa: `saldoNeto = autorizado − confirmado − reservado`. Se comprueban simultáneamente saldo neto global y por agente, máximo por operación y política vigente. La API muestra `available = max(0, saldoNeto)` y `deficit = max(0, -saldoNeto)`: un cargo real inesperado nunca se oculta y bloquea gasto nuevo. El cupo del agente limita el mismo dinero, no crea otra bolsa. Estimado es previsión; reservado compromete saldo; confirmado es consumo demostrado. Los importes usan unidades mínimas enteras y cadenas decimales en JSON, nunca coma flotante binaria. Escala y activo se validan antes de convertir.

Algoritmo del caso de uso de reserva:

1. Derivar propietario, trabajo, tarea y rol desde el contexto persistido. Validar herramienta, cotización, tamaño, vigencia y coincidencia exacta con política.
2. Abrir una transacción de escritura SQLite. Consultar la clave idempotente de propietario/trabajo/operación lógica. Una repetición idéntica devuelve la misma operación; igual clave con contenido distinto devuelve conflicto.
3. Comprobar versión y vigencia de política, estado del trabajo y límites. Insertar operación, reserva e intención pendiente, o rechazar sin firma. Unicidad y actualización condicionada impiden consumir dos veces el mismo disponible.
4. Confirmar SQL. Firmar y persistir identidad y material de autorización cifrado antes de enviar (`prepared`). Un trabajador del mismo proceso reclama intenciones con comparación de estado y lease para recuperarlas tras reinicio.
5. Enviar fuera de SQL. Conciliar y convertir reserva en gasto en una transacción, una única vez. Un bloqueo SQLite produce reintento acotado o error; nunca omisión del control.

El coordinador genera la identidad lógica estable y la conserva en reintentos; incluye el propósito/herramienta. Dos agentes que comparten una compra referencian la misma operación y recibo. La unicidad del hash financiero no sustituye idempotencia de negocio. A/B deben persistir su correspondencia entre operación, pago y resultado para recuperar una entrega sin otro cobro.

## Estados, fallos y conciliación

| Estado/situación | Tratamiento |
| --- | --- |
| `requested` | Solicitud registrada, todavía sin compromiso monetario. |
| `rejected` | Cotización no autorizada o insuficiencia; sin reserva ni firma. |
| `reserved` | Reserva persistida, sin firma utilizable expuesta. Liberación solo demostrando que no existe autorización que pueda liquidar. |
| `prepared` | Identidad y material firmado cifrado persistidos antes de envío; su posible exposición exige conservadurismo al recuperar un fallo. |
| `submitted` | Envío realizado o iniciado; conserva reserva. Registrar payload hash, nonce, expiración, ledger inicial, proveedor e identidad lógica. |
| `confirmed` | Liquidación comprobada; reserva convertida en gasto. Guardar hash final, red, ledger, activo, origen, destino e importe coincidentes. |
| `failed` | Fallo definitivo sin posibilidad de liquidación; liberar con evidencia. Un error no basta si existe autorización válida expuesta. |
| `uncertain` | Timeout, caída o respuesta contradictoria; conserva reserva. Conciliar sin emitir otra autorización para esa compra. |
| Pago confirmado y HTTP perdido/error | Pago sigue `confirmed`; entrega se trata separadamente. Recuperar con identidad original, sin pago nuevo ni devolución prometida. |

La entrega (`pending`, `available`, `failed`) es independiente del pago. El hash de un payload no es necesariamente el hash final de la transacción reconstruida por el facilitator. Cancelar un trabajo impide nuevas reservas/firmas; una autorización ya enviada puede liquidarse. Su conciliación continúa aunque expire la política o se entregue un informe parcial.

Timeouts totales iniciales: A/B y facilitator **20 s**, RPC **10 s**, modelo **60 s**. No representan vigencia de autorización ni certeza de fracaso. La conciliación consulta con espera creciente, sin nuevo cobro. Con hash final consulta su estado; sin hash exige correlación verificable de proveedor/facilitator y eventos del token. `NOT_FOUND`, un indexador incompleto o datos fuera de retención no prueban ausencia de pago. Solo se libera demostrando no liquidación y que la autorización ya no puede liquidar. Una intervención operativa registra evidencia y decisión; sin evidencia suficiente permanece `uncertain`. Un TTL nunca libera por sí solo.

## Viabilidad de x402 y Soroban

La especificación exige x402 v2, una única invocación SEP-41 `transfer(from,to,amount)`, importe/destinatario exactos y entradas de autorización firmadas con expiración. El facilitator verifica, reconstruye, simula y liquida; `/settle` verifica por sí mismo. Un activo clásico se representa mediante SAC, no mediante una operación clásica `payment`. [Especificación oficial](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_stellar.md).

Por esa forma de invocación, interponer `BudgetVault.pay()` cambia el protocolo; allowance de `transfer_from` no restringe automáticamente `transfer`. Registrar un contador después del pago no lo impide. Son conclusiones arquitectónicas de la especificación, no pruebas de una integración local.

La cuenta C puede evaluar activo, destino, función, importe, acumulado y vencimiento en `__check_auth`. Debe revisar subinvocaciones y no ofrecer al mismo firmante otra ruta para retirar fondos, cambiar firmantes o ampliar límites. Cupos por agente requieren clave/rol autenticado; un `agentId` textual no prueba identidad. Consumo y transferencia deben confirmarse o revertirse juntos. [Patrones oficiales de cuentas contractuales](https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns).

**Evidencia de código:** la rama `main` consultada declara que `ClientStellarSigner` admite G/C, `signAuthEntry` y firma de transacción opcional. Hace plausible el adaptador contractual, pero no demuestra la versión publicada 2.28.0, una política concreta ni aceptación del servicio. [Código del firmante](https://github.com/x402-foundation/x402/blob/main/typescript/packages/mechanisms/stellar/src/signer.ts).

**Observación en vivo, 09-10-2026:** GET al [facilitator `/supported`](https://www.x402.org/facilitator/supported) devolvió `x402Version:2`, `scheme:exact`, `network:stellar:testnet`, `extra.areFeesSponsored:true`. No se enviaron solicitudes firmadas a `/verify` ni `/settle`. RPC `getVersionInfo` al [RPC Testnet](https://soroban-testnet.stellar.org) devolvió protocolo `29` y servidor `29.0.0`; no se simuló ni envió transacción.

El [quickstart oficial](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide), actualizado el 03-08-2026, utiliza ese facilitator y separa fondeo XLM, trustline y USDC. El activo candidato exige verificar emisor, SAC, decimales y recepción en ambos proveedores. Friendbot no entrega USDC. No copiar direcciones de ejemplo como configuración validada. Los tokens Testnet no tienen valor real. La comisión patrocinada se registra con facilitator como pagador y no se descuenta otra vez de la bolsa XLM del usuario.

## Versiones consultadas y selección compatible

Metadatos oficiales consultados directamente el 09-10-2026, sin instalaciones. “Última” es la etiqueta publicada observada, no una matriz probada. El stack general se consolida en [herramientas y fuentes](toolchain-and-sources.md).

| Componente | Última observada y publicación | Selección para la prueba |
| --- | --- | --- |
| `@x402/core`, `@x402/stellar`, `@x402/express`, `@x402/fetch` | `2.28.0`, 29-09-2026 | Fijar los cuatro a 2.28.0. Stellar exige Node >=22 y SDK `^16.3.0`; Express acepta `^4` o `^5`. |
| `@stellar/stellar-sdk` | `17.2.1`, 01-10-2026; Node >=22.12 | Recomendar `16.3.1`, publicada y Node >=22, para compartir rama exigida por x402. No forzar override a 17 ni cruzar objetos internos de ambas versiones. |
| `@stellar/freighter-api` | `6.0.1`, 03-12-2025 | Candidata para autorización inicial; probar extensión y red. No es el firmante autónomo del agente. |
| `soroban-sdk` | `29.0.0`, 07-10-2026; Rust mínimo `1.91.0` | Candidata acorde al protocolo 29 observado; fijar compilador compatible y probar contrato. |
| Stellar CLI | `28.1.0`, 26-09-2026 | Último release GitHub observado; compatibilidad compilación/despliegue con protocolo 29 pendiente. No atribuirle versión 29. |

Fuentes: [x402 Stellar](https://registry.npmjs.org/@x402/stellar/2.28.0), [core](https://registry.npmjs.org/@x402/core/2.28.0), [Express](https://registry.npmjs.org/@x402/express/2.28.0), [fetch](https://registry.npmjs.org/@x402/fetch/2.28.0), [SDK 17.2.1](https://registry.npmjs.org/@stellar/stellar-sdk/17.2.1), [SDK 16.3.1](https://registry.npmjs.org/@stellar/stellar-sdk/16.3.1), [Freighter](https://registry.npmjs.org/@stellar/freighter-api/6.0.1), [Soroban](https://crates.io/api/v1/crates/soroban-sdk/29.0.0), [CLI](https://github.com/stellar/stellar-cli/releases/tag/v28.1.0). El peer `@x402/paywall` de Express es opcional; no obliga a crear pantalla de pago para las APIs máquina a máquina.

## Costos de modelos y ampliaciones

Cada llamada reserva una cota conservadora USD antes de iniciarse: precio fechado, tokens de entrada, máximo de salida y otros conceptos facturables. Cupos de llamadas/tokens, duración y reintentos son independientes de x402. Máximo propuesto: cuatro llamadas por agente incluyendo un único reintento, dos agentes concurrentes y diez minutos por trabajo. Modelo y límites de tokens exactos se fijan antes de habilitar la integración.

Sin cota suficiente no se inicia. Una cancelación/timeout no prueba consumo cero: se mantiene la reserva hasta conciliar. No se reintenta un resultado incierto si el proveedor no permite consultar o garantizar idempotencia del cargo. Un reintento autorizado de modelo puede facturarse otra vez y necesita capacidad adicional. Si el cargo real supera la reserva, se registra íntegro, se muestra el déficit (`over_limit`) y se bloquea gasto nuevo; no se falsea el consumo para satisfacer una restricción local. Credenciales dedicadas y topes del proveedor complementan el registro local. OpenRouter y LangGraph siguen pendientes; no se supone que solucionen la facturación.

Solo el responsable autoriza una ampliación mediante una nueva versión de política. Las reservas previas conservan trazabilidad y una reducción no deja el autorizado por debajo de gasto más reservas comprometidas.

## Aceptación pendiente

| ID | Escenario | Evidencia exigida |
| --- | --- | --- |
| PAY-01 | A compra 0,03 sobre 0,05 USDC Testnet; B intenta 0,03 | A confirmado; B rechazado sin firma; disponible 0,02; reservas cero. |
| PAY-02 | Otro trabajo autoriza 0,06 | Dos compras de 0,03 con destinatarios y entregas distintos. |
| PAY-03 | Precio 0,04; máximo 0,03 | Rechazo aun con saldo global suficiente. |
| PAY-04 | Dos reservas concurrentes 0,03 sobre 0,05 | Una ganadora; repetición idempotente no duplica movimientos. |
| PAY-05 | Caída antes/después de firmar/enviar | Recuperación de la misma operación; ninguna autorización nueva mientras pueda liquidarse la anterior. |
| PAY-06 | Liquidación confirmada, HTTP perdido | Gasto conservado; recuperación sin otro pago. |
| PAY-07 | Cuenta C integrada | `/verify`, `/settle`, hash y política; rechazos por exceso, destino, vencimiento, carrera y evasión incluso eludiendo broker. Pruebas aisladas no bastan. |
| PAY-08 | Factura de modelo incierta | Reserva USD retenida y conciliada por separado. |

Guardar versiones, hash del contrato, configuración pública, red, activo, cuentas, comprobantes y resultados negativos redactados. Pendientes: modelo/precios, activo concreto verificado, firma C de la versión publicada y compatibilidad CLI/protocolo. Si PAY-07 no se demuestra, la demo usa y anuncia el modo G con confianza en backend; no presenta garantía Soroban sobre ese pago.

## Aplicación de los contextos

No habilitar A/B ni firma para archivos privados, aun si coinciden en nombre con pricing.ts; los topes externos cero y la lista vacía de capacidades se comprueban antes de IO o reserva. El caso público fijo DEMO-01 utiliza otra identidad, aceptación y proyección de gastos/actividad/resultado.

El prototipo Figma representa estos límites, sin ejecutar compras ni imponerlos autoritativamente. PAY-01–PAY-08 continúan como criterios de integración futuros y no alteran la política de la revisión estándar.
