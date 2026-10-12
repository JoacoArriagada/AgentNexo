# Contract: Contratación

Canónico ../../../docs/local-api-contract.md; DTO packages/api-contracts/src/.
/api/v1/jobs lista/crear/detalle/PATCH/DELETE, policy GET/PUT, authorizations POST;
/api/v1/orders POST/lista/detalle/fund/start/cancel; /jobs/:id/events/budget/report;
exportación MD/JSON y operaciones demo según contrato canónico. No inventar rutas divergentes.
Mutaciones Idempotency-Key; expectedVersion para edición; X-Actor-Id por petición.
422 límites/formato, 412 obsoleta, 409 política/estado/plaza, 403 rol, 404 privado ajeno.
Dinero cadena entero canónico y unidad explícita; nunca float en DTO. Proveedor no ve código.
