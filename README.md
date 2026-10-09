# AgentNexo

Equipos de IA para trabajos con alcance, presupuesto y permisos definidos.

**Estado: propuesta documental; aplicación, contratos y pagos pendientes de implementar.** Revisión de arquitectura y fuentes: 9 de octubre de 2026. La compatibilidad documental no sustituye una prueba integrada en Testnet.

AgentNexo ofrecerá servicios o paquetes de trabajo ejecutados por agentes especializados. El cliente define el resultado y autoriza condiciones iniciales; la plataforma distribuye responsabilidades, coordina dependencias y limita el paralelismo según los recursos. La cantidad de agentes es una decisión interna. El usuario recibe avances, entregables y avisos cuando deba decidir una ampliación de alcance o recursos.

El público inicial propuesto son desarrolladores y pequeñas agencias que operan automatizaciones para clientes. Debe validarse si la coordinación, la separación de presupuestos y las compras a proveedores independientes resuelven un problema por el que pagarían. No hay demanda, precios ni ahorro demostrados.

## Decisiones y límites

| Estado | Contenido |
| --- | --- |
| Confirmado como dirección | Contratación por trabajo o paquete; Stellar para liquidación verificable, Soroban para desarrollar reglas de autorización y x402 para servicios HTTP compatibles; modelos, archivos y coordinación fuera de la blockchain. |
| Alcance cerrado de la propuesta de MVP | Una revisión estática de software, dos agentes, dos servicios HTTP demostrativos, presupuesto y permisos por trabajo, compras y rechazos en Stellar Testnet. |
| Base técnica propuesta | Web sencilla, un backend Node.js/TypeScript, persistencia local y herramientas Stellar/x402 de la tabla inferior. Ninguna dependencia está instalada por esta revisión. |
| Pendiente de prueba | Versiones compatibles, facilitator operativo, activo de Testnet, firmante automatizado e integración de la política Soroban con la liquidación x402. |
| Pendiente de decisión | Proveedor y modelo de IA, tarifas comerciales, LangGraph y OpenRouter. Estos dos últimos no son obligatorios. |
| Visión futura | Otros paquetes de software, web, móvil e investigación y más proveedores, sujetos a validación. |

Quedan fuera del MVP el marketplace abierto, cien agentes, varios sectores implementados, suscripciones obligatorias, token propio, infraestructura distribuida, Mainnet y ejecución de código no confiable. El contexto de hackathon no añade requisitos: bases, fechas y condiciones del evento no están verificadas.

## Automatización del MVP

**Paquete: revisión estática de un módulo JavaScript/TypeScript.** Entrada: objetivo, criterios de aceptación y hasta tres archivos de texto, con un máximo conjunto propuesto de 1.000 líneas. La demostración usará un ejemplo público o sintético. No instala dependencias, ejecuta pruebas ni modifica el repositorio del cliente.

| Participante | Responsabilidad | Permisos y dependencia |
| --- | --- | --- |
| Agente analista | Revisar estructura y posibles defectos; contrastar métricas del servicio A. | Leer la entrada y solicitar únicamente A; sin firma ni cambio de límites. |
| Agente de diseño de pruebas | Proponer casos límite y criterios de verificación; consultar B. | Leer la entrada y solicitar únicamente B; sin ejecutar código ni firmar pagos. |
| Coordinador del backend | Mantener estados, iniciar tareas independientes y consolidar salidas. | Lógica determinista, no un tercer agente. El informe espera ambas salidas o sus fallos documentados. |

Los agentes pueden usar el mismo modelo con instrucciones y herramientas distintas. Cada uno tendrá asignación monetaria, máximo de llamadas y tokens, plazo y permisos explícitos. Valores iniciales propuestos: hasta cuatro llamadas por agente, incluido como máximo un reintento, concurrencia de dos agentes y diez minutos por trabajo. Los límites de tokens se fijarán al seleccionar el modelo, antes de ejecutar.

Los **dos servicios externos de demostración** representan proveedores independientes de la plataforma:

| Servicio | Compra y resultado | Identidad de demostración |
| --- | --- | --- |
| A: análisis estático | Una petición HTTP devuelve métricas y observaciones calculadas sobre el ejemplo admitido. | Endpoint y destinatario de Testnet A, autorizados de antemano. |
| B: catálogo de casos de prueba | Una petición HTTP devuelve casos parametrizados para las firmas y condiciones del ejemplo; no ejecuta pruebas. | Endpoint y destinatario de Testnet B, distintos de A y autorizados de antemano. |

Ambas APIs podrán alojarse en un solo proceso de demostración, separado lógicamente del backend y con dos rutas y destinatarios distintos. Serán controladas por el proyecto, identificadas como demostrativas y protegidas con x402; no se presentarán como proveedores comerciales asociados. Sus respuestas serán limitadas al ejemplo soportado. Los modelos de IA son otro consumo, no cuentan como estas dos APIs.

El entregable es un informe descargable con hallazgos referidos a archivos/líneas, evidencia disponible, casos de prueba propuestos, limitaciones y comprobantes de compras. Si B se rechaza, el agente puede proponer casos con la entrada original, indicando que no obtuvo el catálogo externo.

## Presupuesto, permisos y concurrencia

La autorización incluye objetivo, alcance, entregables, vencimiento, cupos por agente, proveedores permitidos y máximo por operación. Por proveedor se fija herramienta, URL/método autorizado, destinatario, red, activo y precio máximo. Un HTTP 402 es una cotización, no una autorización del usuario.

El presupuesto global es un conjunto de **límites por categoría y moneda que no se intercambian automáticamente**. Así se evita sumar dólares reales, tokens de prueba y XLM como si fueran un mismo saldo. Ejemplo ilustrativo, sin carácter de tarifa:

| Categoría del trabajo | Tope y asignación |
| --- | --- |
| Modelos por API tradicional | 1,00 USD total; hasta 0,50 USD por agente. |
| Compras externas | 0,05 USDC de Testnet compartidos; hasta 0,03 por agente y operación. |
| Comisiones de red imputables al trabajo | Hasta 0,10 XLM de Testnet; preparación y depósitos de cuenta se muestran aparte. |
| Comisión AgentNexo | 0 en la demostración; precio comercial pendiente. |

Por categoría: `disponible = autorizado − confirmado − reservado`. Una compra se contabiliza una vez, aunque se consulte por trabajo y agente. El cupo de un agente es un límite adicional, no una reserva ni un saldo nuevo. Se usan unidades mínimas enteras o decimales exactos y los decimales verificados del activo, sin coma flotante binaria para dinero.

Un **PaymentBroker**, módulo del backend ajeno al modelo, valida cada petición y comprueba atómicamente el cupo global, el del agente y el máximo por operación antes de reservar. Con SQLite se propone una transacción de escritura breve, actualización condicionada y clave única por operación lógica; HTTP y blockchain ocurren después del commit. Un bloqueo se reintenta de forma acotada o rechaza, nunca se interpreta como permiso. SQLite permite una sola transacción de escritura simultánea [7].

Estados mínimos de compra: solicitada, rechazada o reservada, enviada, confirmada, fallida o incierta. La reserva persiste antes de firmar/enviar. Una liquidación incierta conserva la reserva hasta reconciliar estado y vigencia de la autorización; un timeout o reinicio no habilita otro pago. Los reintentos conservan la identidad de la compra. Un pago confirmado con entrega HTTP fallida sigue siendo gasto confirmado; se intenta recuperar el resultado sin prometer devolución automática. El cierre del trabajo mantiene visibles las operaciones pendientes.

Las APIs de modelos necesitan controles propios de llamadas, tokens de entrada/salida, reintentos y duración, reserva conservadora según precios vigentes y conciliación con consumo reportado. Se usarán credenciales dedicadas y límites del proveedor cuando existan. Una estimación de tokens o un timeout no garantizan la factura final: si no se conoce una cota suficiente, la llamada no se inicia. El panel distingue estimación, reserva y gasto confirmado; Soroban no limita esa factura externa.

Ante falta de recursos, el trabajo continúa con lo disponible o queda parcial/pausado. Una ampliación exige nueva autorización registrada del responsable; los agentes y el coordinador no aumentan su propio cupo. La interfaz ofrece esa decisión sin recargas automáticas.

## Stellar, Soroban y x402: compatibilidad y alcance real

Stellar liquidará pagos a proveedores compatibles y permitirá contrastarlos con la red. No certifica calidad, veracidad ni entrega de respuestas. Código privado, documentos, prompts y conversaciones permanecen fuera de la blockchain; solo se publican los datos financieros y de autorización necesarios. No se necesitan transferencias entre agentes internos.

El quickstart oficial presenta x402 v2 y los paquetes `@x402/core`, `@x402/express`, `@x402/fetch` y `@x402/stellar` [1]. Flujo previsto: obtener condiciones HTTP 402, validar y reservar en el broker, construir y firmar la autorización, solicitar el recurso con el pago, verificar/liquidar mediante el facilitator y reconciliar. No se habilita un cliente que firme automáticamente cualquier 402.

La especificación `exact` de Stellar utiliza una invocación `transfer(from, to, amount)` del token SEP-41 y entradas de autorización firmadas con vencimiento. El facilitator patrocina la comisión de liquidación y firma la transacción final; red, token, destinatario e importe deben coincidir [2]. El activo clásico se usa mediante su contrato SAC, no mediante una operación clásica `payment` en este esquema.

**Conclusión arquitectónica:** un `BudgetVault.pay()` interpuesto no satisface sin adaptación la forma exigida por `exact`; una allowance de `transfer_from` tampoco limita un `transfer` autorizado por otra vía. Registrar después el gasto en un contrato no lo bloquea. Esta conclusión se deriva de la invocación especificada [2].

La vía a evaluar primero es una **cuenta contractual por trabajo**, con saldo de token y reglas en `__check_auth` sobre activo, destinatarios, cupos acumulados/por operación y vencimiento. Soroban documenta este patrón [3]. Para atribuir cupos contractuales por agente hace falta una identidad ligada al firmante, por ejemplo claves de sesión por rol custodiadas por el broker; un `agentId` libre enviado por el modelo no basta. Los agentes nunca reciben claves.

Es una hipótesis de integración. La validación del límite, actualización del consumo y transferencia deben ser atómicas. Las C-accounts requieren autorización conforme al contrato y una G-account que envíe/pague la transacción [4]. Se comprobará que el SDK admita ese firmante y que el facilitator acepte y simule su autorización. Freighter puede firmar entradas de autorización, pero esa capacidad no prueba compatibilidad con cualquier política personalizada [5].

El facilitator del quickstart, `https://www.x402.org/facilitator`, es un candidato concreto: la respuesta pública de `/supported` consultada vía web anuncia x402 v2, `exact`, `stellar:testnet` y comisiones patrocinadas [11]. Es evidencia de soporte declarado; no se ejecutaron peticiones firmadas a `/verify` o `/settle` ni se comprobó una cuenta contractual personalizada.

La prueba temprana debe registrar versiones y evidencia de:

1. Red `stellar:testnet`, x402 v2/`exact`, activo/contrato/decimales, cuenta pagadora, firmante y destinatarios A/B.
2. Capacidades del facilitator (`/supported`) y aceptación efectiva de `/verify` y `/settle`; anunciar soporte no prueba compatibilidad con una C-account concreta.
3. Compra permitida y rechazos por exceso, destinatario inválido, autorización vencida y gastos concurrentes. Para afirmar control contractual, el rechazo debe proceder de la liquidación/política Soroban, incluso eludiendo el broker en una prueba controlada.
4. Ausencia de rutas con la misma autoridad delegada para transferir, retirar fondos, cambiar límites o ampliar permisos sin la política. Los poderes del propietario/administrador se declaran aparte.

Si la combinación no funciona sin ampliar el alcance, el MVP puede mostrar x402 desde una cuenta G dedicada y prefinanciada con fondos de prueba, firmada exclusivamente por el broker. Se rotula **control de presupuesto en aplicación**: esa clave puede eludir los topes y no existe garantía contractual. La prueba Soroban queda separada y pendiente de integración; no se presenta como protección del pago x402. Aprobar pruebas aisladas tampoco demuestra integración.

Freighter se propone para configuración y autorización inicial del usuario en Testnet; el firmante automatizado depende de la prueba de viabilidad. No se pide la clave privada de la wallet del usuario ni se automatizan clics de firma. Firmar manualmente cada compra puede servir para diagnóstico, pero no cumple la experiencia autónoma propuesta.

USDC de Testnet es el activo candidato, sujeto al soporte efectivo del facilitator. El quickstart documenta XLM de prueba, trustline y obtención separada de USDC [1]. Friendbot no entrega USDC. Se verificará emisor y contrato SAC antes de usarlo. Los tokens de Testnet no tienen valor real. La comisión patrocinada se muestra con su pagador; no se duplica como gasto del cliente. Preparación y mantenimiento contractual tienen costos propios.

## Herramientas mínimas propuestas

| Componente | Justificación y compatibilidad documental |
| --- | --- |
| Web con HTML/CSS y TypeScript | Formulario, autorización, progreso y gastos; servida por el backend. No requiere framework de interfaz. |
| Node.js LTS, TypeScript y Express | Un proceso para API, coordinador y broker. Express coincide con el adaptador x402 oficial [1]. Fijar una LTS soportada y comprobar `engines`/dependencias al instalar [6]. |
| SQLite y archivos locales | Tareas, permisos, reservas y recibos transaccionales; entregables fuera de cadena. Una instancia y dos agentes. Driver compatible con Node pendiente; sin ORM ni servidor de base de datos obligatorio [7]. |
| `@stellar/stellar-sdk` y RPC de Testnet | SDK mantenido por SDF para Node/navegador; operaciones, estado y conciliación sin operar un nodo [8]. |
| Stellar CLI | Preparar cuentas, compilar, desplegar e invocar contratos en la futura prueba [9]. Herramienta de desarrollo, no de libre acceso del modelo. |
| Rust y `soroban-sdk` | Desarrollar y probar reglas de autorización. SDK de contratos de SDF; fijar versiones compatibles con el protocolo de red [10]. |
| SDK x402 v2 para Stellar | `@x402/core`, `@x402/stellar` y adaptadores de cliente HTTP/Express; versiones compatibles y sin mezclar interfaces de otros paquetes [1, 2]. |
| Freighter para Testnet | Autorización inicial; `@stellar/freighter-api` si la web necesita conexión/firma. Comprobar red y método de firma [5]. |

Se necesita acceso a un facilitator compatible existente, sin operarlo como infraestructura propia del MVP. Se elegirá una API de modelos según costo, límites y calidad; **OpenRouter queda pendiente**. Basta un coordinador con estados sencillos; **LangGraph queda pendiente**. No se prescriben Next.js, Tailwind, PostgreSQL/Prisma, colas distribuidas ni un monorepo de paquetes.

## Demostración y criterios de aceptación

Todos los criterios están pendientes de ejecución; escribirlos no significa haberlos verificado.

| Prueba | Evidencia de aceptación |
| --- | --- |
| Configurar trabajo | Objetivo, archivos, entregable, límites por categoría/agente/operación y proveedores persistidos antes de iniciar. |
| Coordinar dos agentes | Estados y dependencias visibles, máximo dos tareas de agente simultáneas e informe tras completar o cerrar ambas. |
| Comprar y rechazar | Bolsa externa de 0,05 USDC de Testnet y precio de 0,03 por API: A reserva/compra primero; B se rechaza por saldo. A deja transacción confirmada; B, motivo y ninguna autorización de pago emitida. Saldo final 0,02; reservas 0. |
| Demostrar ambos proveedores | Otro trabajo con 0,06 permite A y B a 0,03 cada uno, con resultados y destinatarios distintos. No amplía automáticamente el primer trabajo. |
| Máximo por operación | Una oferta de 0,04 se rechaza frente al máximo 0,03 aunque el saldo global alcance. |
| Concurrencia y duplicados | Dos solicitudes de 0,03 compiten por 0,05: solo una obtiene reserva. Reenviar una operación no crea otra reserva ni otro gasto. |
| Incertidumbre y fallo HTTP | Tras timeout/reinicio se conserva reserva y se reconcilia; pago confirmado sin entrega visible, sin volver a pagar automáticamente. |
| Información al usuario | Informe, avances, confirmados, reservas y disponible por moneda/categoría; ampliaciones requieren decisión explícita. |
| Soroban, si se declara integrado | Rechazo contractual en x402 real y pruebas de rutas de evasión. Si falta, la demo declara su confianza en el broker. |

## Próximos pasos

1. Validar con cinco desarrolladores/agencias la frecuencia de esta tarea, proveedores que pagarían por uso, problemas de presupuesto y disposición a pagar. Comparar con su flujo actual.
2. Ejecutar posteriormente la prueba de pago y autorización descrita arriba. Guardar versiones, configuración pública, transacciones y rechazos. Decidir cuenta contractual integrada o control explícito en aplicación antes de ampliar la interfaz.
3. Elegir modelo/proveedor y límites medibles; confirmar las dos APIs y precios demostrativos. No se presume que una API comercial acepte Stellar.
4. Implementar una instancia con web, persistencia, coordinador y broker; conectar los dos agentes y servicios. Verificar los criterios y medir utilidad del informe, consumo, errores y reintentos.

El prompt complementario conserva instrucciones para una futura preparación del repositorio. No ordena ejecutar ahora commits, ramas, despliegues o pagos. Esta revisión solo actualiza documentación.

## Fuentes oficiales consultadas

Consulta: 09-10-2026. Se revisaron documentación y la respuesta pública de capacidades del facilitator vía web. No se probaron SDKs instalados, firmas, verificación ni liquidación. Versiones y capacidades deberán comprobarse de nuevo al implementar.

1. [Stellar: quickstart x402](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide).
2. [x402: especificación exact en Stellar](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_stellar.md).
3. [Stellar: patrones de cuentas contractuales](https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns).
4. [Stellar: firma de invocaciones Soroban](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations).
5. [Stellar: firma de autorizaciones con Freighter](https://developers.stellar.org/docs/build/guides/freighter/sign-auth-entries).
6. [Node.js: versiones y soporte](https://nodejs.org/en/about/previous-releases).
7. [SQLite: transacciones](https://sqlite.org/lang_transaction.html).
8. [Stellar: SDKs de cliente](https://developers.stellar.org/docs/tools/sdks/client-sdks).
9. [Stellar CLI](https://developers.stellar.org/docs/tools/cli/stellar-cli).
10. [Stellar: SDKs de contratos](https://developers.stellar.org/docs/tools/sdks/contract-sdks).
11. [Facilitator del quickstart: capacidades publicadas](https://www.x402.org/facilitator/supported).
