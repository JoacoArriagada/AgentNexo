# Contract: Catálogo

Canónico: ../../../docs/local-api-contract.md; DTO packages/api-contracts/src/.
GET /api/v1/offers?search=&profile=; GET /offers/:id. Visitante sólo aprobadas.
POST /offers {name,description,profile,priceMinor}; PATCH /offers/:id con expectedVersion.
POST /offers/:id/submit {expectedVersion}; GET /moderation admin.
POST /offers/:id/moderate {expectedVersion,decision,reason}.
Mutaciones usan Idempotency-Key y actor por header; 403 sin rol, 404 ajeno,
412 edición obsoleta, 422 DTO inválido, 409 estado incompatible.
