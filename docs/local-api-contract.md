# Contrato API del prototipo local

Fecha: 2026-10-12. Este contrato implementa los doce casos de uso de la ERS mediante actores y proveedores locales. No implementa autenticación, wallet, blockchain ni inferencia remota. Financiación, garantía y compras se identifican como simulaciones locales persistentes.

Base `/api/v1`. JSON UTF-8, fechas ISO UTC, IDs opacos. El cliente conserva `actorId` y envía `X-Actor-Id`; no existe actor global mutable. Omitir la cabecera permite solamente catálogo y contexto público. Los actores demo permiten probar permisos y propiedad sin credenciales. Error: `{error:{code:string,message:string,details?:{field:string,reason:string}[]}}`. Dinero: cadenas de enteros canónicos; no sumar monedas diferentes.

Mutaciones de negocio requieren `Idempotency-Key`; misma ruta, actor, clave y cuerpo devuelve la misma respuesta; otro cuerpo devuelve 409. Ediciones incluyen `expectedVersion:number`; una versión obsoleta devuelve 412. IDs/políticas inválidos o estado incompatible devuelven 409; datos inválidos 422; falta de rol 403; recurso privado ajeno 404.

Escalas fijas del demo: USD 9 (USD 1 = `1000000000`), USDC_DEMO 7 (0,03 = `300000`), XLM_DEMO 7 (0,10 = `1000000`). Los límites de Policy usan esas mismas escalas: modelLimitMinor USD; toolLimitMinor/maxOperationMinor USDC_DEMO; feeLimitMinor XLM_DEMO. En archivos propios herramientas/comisiones son cero. Sólo public-demo + two-role-demo permite A/B. Financiación/recibos nunca representan fondos reales.

## DTO públicos

```ts
type Role = 'visitor' | 'buyer' | 'provider' | 'admin';
type ExecutionState = 'draft' | 'awaiting_authorization' | 'ready' | 'queued' | 'running' | 'paused' | 'completed' | 'partial' | 'cancelled' | 'failed';
type EscrowState = 'unfunded' | 'funded' | 'running' | 'delivered' | 'disputed' | 'paid' | 'refunded';
type Money = { currencyKey: 'USD' | 'USDC_DEMO' | 'XLM_DEMO'; scale: number; minor: string };
type Actor = { id: string; name: string; roles: Role[] };
type InputFile = { id?: string; name: string; content: string; language?: 'javascript' | 'typescript' };
type Offer = {
  id: string; version: number; providerId: string; providerName: string;
  name: string; description: string; profile: 'reviewer' | 'two-role-demo';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  price: Money; moderationReason?: string; createdAt: string; updatedAt: string;
};
type Policy = {
  version: number; digest: string; inputDigest: string;
  mode: 'reviewer' | 'two-role-demo'; modelLimitMinor: string;
  toolLimitMinor: string; feeLimitMinor: string; maxOperationMinor: string;
  allowTools: boolean; accepted: boolean;
  deadlines: { startMinutes: number; deliveryMinutes: number; acceptanceHours: number; disputeDays: number };
};
type Job = {
  id: string; version: number; buyerId: string; title: string; objective: string;
  acceptanceCriteria: string[]; files: InputFile[]; inputDigest: string;
  state: ExecutionState; context: 'private-review' | 'public-demo';
  policy?: Policy; pendingPolicy?: Policy; amendmentId?: string; authorizationId?: string; orderId?: string;
  archived: boolean; createdAt: string; updatedAt: string;
};
type Order = {
  id: string; version: number; jobId: string; buyerId: string; providerId: string;
  arbiterId: string; offer: Offer; policy: Policy; price: Money;
  financingState: 'pending' | 'confirmed' | 'rejected' | 'uncertain';
  escrowState: EscrowState; executionState: ExecutionState;
  deliveryState: 'pending' | 'available' | 'failed';
  createdAt: string; fundedAt?: string; startedAt?: string; deliveredAt?: string;
  disputedAt?: string; closedAt?: string; startDeadline?: string;
  deliveryDeadline?: string; acceptanceDeadline?: string; disputeDeadline?: string;
  dispute?: { reason: string; evidence: string; response?: string; resolution?: string };
};
type BudgetBucket = {
  category: 'models' | 'tools' | 'fees' | 'contract'; currencyKey: string; scale: number;
  authorized: string; reserved: string; confirmed: string; available: string; deficit: string;
};
type Payment = {
  id: string; providerId: string; kind: 'model' | 'tool'; amount: Money;
  financialState: 'rejected' | 'reserved' | 'prepared' | 'submitted' | 'confirmed' | 'uncertain' | 'failed';
  deliveryState: 'pending' | 'available' | 'failed'; reason?: string;
  receipt?: { id: string; simulation: true; createdAt: string }; createdAt: string;
};
type JobEvent = { sequence: number; type: string; message: string; actorId: string; createdAt: string };
type Finding = { id: string; fileId: string; fileName: string; startLine: number; endLine: number; severity: 'high' | 'medium' | 'low'; title: string; explanation: string; evidence: string; recommendation: string; uncertainty: string };
type Report = {
  jobId: string; version: number; status: 'complete' | 'partial'; createdAt: string;
  summary: string; findings: Finding[];
  testCases: { id: string; title: string; description: string; expectedResult: string; executed: false; findingIds: string[] }[];
  criteria: { criterion: string; status: 'sustentado' | 'no_sustentado' | 'no_evaluado'; evidence: string[] }[];
  limitations: string[]; contributions: { providerId: string; status: 'available' | 'failed' | 'rejected' }[];
};
```

Las listas devuelven `{items:T[]}`; eventos `{items:JobEvent[],nextCursor:number}`; presupuesto `{jobId,financialState,buckets:BudgetBucket[]}`. `GET /context` devuelve `{actors:Actor[],mode:'local-demo',simulation:true}`. Catálogo de proveedores `{items:[{id,name,kind,description,price,ready:true,simulation:true}]}`. Notificación `{id,actorId,jobId?,orderId?,title,message,read,createdAt}`. Preferencias `{timezone,notificationsEnabled}`. Operación `{admissionPaused,spendingPaused,activeJobs,capacity:10,pendingOperations,disputes}`.

## Rutas

| Método y ruta | Entrada | Respuesta |
|---|---|---|
| GET /context | Público | Contexto local |
| GET /providers | Público | Catálogo demo |
| GET /offers | `search?`, `profile?`; público solo aprobadas; proveedor ve propias | Lista de ofertas |
| GET /offers/:id | Público si aprobada; propietario/admin para otras | Offer |
| POST /offers | Proveedor: `{name,description,profile,priceMinor}` | 201 Offer borrador |
| PATCH /offers/:id | Propietario: `{expectedVersion,name?,description?,profile?,priceMinor?}` | Offer nueva versión; contratos anteriores conservan snapshot |
| POST /offers/:id/submit | Propietario `{expectedVersion}` | Offer pendiente |
| POST /offers/:id/withdraw | Propietario `{expectedVersion,reason}` | Offer suspendida; nuevas ventas bloqueadas, snapshots anteriores intactos |
| GET /moderation | Admin | Ofertas pendientes y suspendidas |
| POST /offers/:id/moderate | Admin `{expectedVersion,decision:'approve'|'reject'|'suspend',reason}` | Offer |
| GET /jobs | Comprador, `archived?` | Lista propia |
| POST /jobs | `{title,objective,acceptanceCriteria,files,context?}` | 201 Job |
| GET /jobs/:id | Comprador propio; admin metadatos operativos | Job |
| PATCH /jobs/:id | `{expectedVersion,title?,objective?,acceptanceCriteria?,files?}` | Job borrador; invalida política |
| DELETE /jobs/:id | `{expectedVersion}`; solo borrador sin compromisos | 204 |
| PUT /jobs/:id/policy | `{expectedVersion,mode,modelLimitMinor,toolLimitMinor,feeLimitMinor,maxOperationMinor,allowTools}` | Policy y Job mediante `{job,policy}` |
| GET /jobs/:id/policy | Propietario | Policy |
| POST /jobs/:id/policy/amendments | Propietario `{expectedVersion,modelLimitMinor,toolLimitMinor,feeLimitMinor,maxOperationMinor}`; sólo aumentos con al menos un cambio | `{job,policy,amendmentId}`; política propuesta en job.pendingPolicy, sin cambiar límites efectivos |
| POST /jobs/:id/authorizations | `{policyVersion,policyDigest,accept:true}` | 201 `{authorizationId,job}` |
| POST /orders | Comprador `{jobId,offerId,offerVersion,authorizationId}` | 201 Order pendiente; reserva capacidad antes financiación |
| GET /orders | Actor privado, solo órdenes propias; admin metadatos | Lista Order |
| GET /orders/:id | Parte o admin | Order; no entrada privada al proveedor |
| POST /orders/:id/fund | Comprador `{}`; simulación identificada | Order financiada |
| POST /orders/:id/start | Comprador `{}` | 202 `{order,job}` |
| POST /orders/:id/cancel | Comprador `{reason?}` | `{order,job}` |
| POST /orders/:id/accept | Comprador `{}` | Order pagada |
| POST /orders/:id/dispute | Comprador `{reason,evidence}` | Order disputada |
| POST /orders/:id/respond | Proveedor propio `{response}` | Order |
| POST /orders/:id/resolve | Árbitro asignado `{outcome:'pay'|'refund',reason}` | Order cerrada |
| POST /orders/:id/renounce | Proveedor propio `{reason}` | Order reembolsada |
| POST /orders/:id/claim | Parte `{kind:'no_start'|'no_delivery'|'silence'|'unresolved'}` | Order tras validar vencimiento |
| GET /jobs/:id/events | `after?` entero | Eventos ordenados |
| GET /jobs/:id/budget | Propietario | Bolsas separadas |
| GET /jobs/:id/payments | Propietario | Lista Payment |
| POST /jobs/:id/demo-scenario | Propietario público, antes de contratar: `{serviceA?,serviceB?}`; cada valor `normal/uncertain/delivery_failed/price_exceeded` | Configuración de simulación |
| POST /jobs/:id/payments/:operationId/reconcile | Propietario o admin; `{outcome:'confirmed'|'failed',reason}`; sólo incierta | Payment conciliada, misma identidad y sin otro consumo |
| POST /jobs/:id/payments/:operationId/recover-delivery | Propietario `{}`; pago confirmado con entrega fallida | Payment entregada, mismo cargo; nueva versión informe |
| GET /jobs/:id/report | Propietario | Report o 409 REPORT_NOT_READY |
| GET /jobs/:id/report/download | `format=markdown|json` | Attachment de misma versión |
| POST /jobs/:id/archive | Propietario, estado terminal `{}` | Job |
| POST /jobs/:id/unarchive | Propietario `{}` | Job |
| DELETE /jobs/:id/content | Propietario, ejecución detenida `{}` | Job con contenido retirado |
| GET /sales | Proveedor | Órdenes propias y totales separados por moneda |
| GET /notifications | Actor privado | Lista propia |
| PATCH /notifications/:id | `{read:true}` | Notificación |
| POST /notifications/read-all | `{}` | `{updated:number}` |
| GET/PATCH /preferences | PATCH `{timezone?,notificationsEnabled?}` | Preferencias propias |
| GET /operations | Admin | Operación |
| POST /operations/control | Admin `{admissionPaused?,spendingPaused?,reason}` | Operación y evento auditado |

El frontend interpreta los DTO, conserva el actor por petición y vuelve a leer el recurso después de una mutación. Polling de ejecución cada 1–2 s mientras esté activa. Ningún GET inicia análisis ni movimientos. Un trabajo privado nunca adquiere capacidades A/B por coincidencia con el fixture.

La ampliación mantiene job.policy vigente hasta aceptar explícitamente la nueva versión/digest por `/authorizations`. Al aceptarla cambia sólo la política efectiva del trabajo: el snapshot original `Order.policy`, el precio, la entrada, el perfil, las capacidades y los vencimientos no se alteran. Reservas y consumos existentes permanecen. Aceptar no reinicia ejecución ni extiende diez minutos. Las ampliaciones privadas conservan límites externos cero; no se admiten reducciones ni contratación cerrada.

Retirar contenido elimina archivos, objetivo/criterios e informe y redacta evidencia de checkpoints y respuestas idempotentes sensibles. Repetir una petición histórica cuya respuesta contenía datos retirados devuelve 410 `CONTENT_REMOVED` sin recrear recurso ni efecto; clave/digest se conservan. Los registros financieros permanecen. Cancelar una orden sin financiación registra movimiento cero.

## Transiciones de garantía local T1–T10

1. T1: financiado → ejecución; inicio antes de 30 minutos, preparación y autorización válidas.
2. T2: financiado → reembolso por cancelación comprador o reclamación de cualquiera de las partes desde 30 minutos sin inicio.
3. T3: ejecución → entregado, informe disponible antes de 15 minutos; abre aceptación de 48 horas.
4. T4: reembolso por reclamación desde 15 minutos sin entrega ni disputa.
5. T5: comprador acepta entrega antes de vencimiento y sin disputa → pago total al proveedor.
6. T6: reclamación desde 48 horas de entrega sin disputa → pago total al proveedor.
7. T7: comprador disputa ejecución o entrega antes de vencimiento → disputado, detiene nuevo despacho.
8. T8: árbitro fijado, independiente de partes, resuelve pago o reembolso total antes de 7 días.
9. T9: proveedor renuncia antes de cierre → reembolso total al comprador.
10. T10: reclamación desde 7 días de disputa sin resolución → reembolso total.

Fechas absolutas persistentes; reiniciar no renueva plazos. En el límite exacto procede reclamación, no acción original. Un cierre es único, total y hacia el destino fijado; el precio no financia herramientas. Esta máquina local acredita comportamiento del prototipo, nunca liquidación ni seguridad on-chain.
