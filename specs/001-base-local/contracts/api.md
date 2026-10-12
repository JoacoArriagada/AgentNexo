# Contract: Base local

Autoridad canónica: ../../../docs/local-api-contract.md y packages/api-contracts/src/.
GET /api/v1/context público: actors, mode local-demo, simulation true.
GET /api/v1/health: estado local. X-Actor-Id selecciona actor demo por petición.
Errores {error:{code,message,details?}}; fechas ISO UTC; JSON UTF-8.
Sin cookies, tokens ni login. Mutaciones: Idempotency-Key; edición expectedVersion.
Actor inválido y DTO inválido se rechazan, sin alterar datos. El frontend sólo importa DTO.
