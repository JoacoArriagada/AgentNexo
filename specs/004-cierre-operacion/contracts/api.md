# Contract: Cierre

Canónico ../../../docs/local-api-contract.md; API base/api/v1.
POST /orders/:id/accept, dispute{reason,evidence}, respond{response}, resolve{outcome:pay|refund,reason}, renounce{reason}, claim{kind:no_start|no_delivery|silence|unresolved}.
GET /sales; GET/PATCH notifications, read-all; GET/PATCH preferences;
GET operations y POST operations/control flags+reason; jobs archive/unarchive/content según contrato.
Mutaciones Idempotency-Key y actor header; 403 rol,404 ajeno,409estado/plazo/conflicto,422DTO.
No GET realiza cierre. Simulación:true en recibos; destinos fijos, dinero entero exacto.
