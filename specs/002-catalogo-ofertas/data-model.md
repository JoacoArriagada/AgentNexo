# Data model: Catálogo

Offer: id estable, version entero positivo, providerId FK, name 3–100, description 20–2000,
profile reviewer/two-role-demo, status draft/pending/approved/rejected/suspended, priceMinor
entero positivo canónico, createdAt/updatedAt, moderationReason.
Version snapshot: contenido por offerId/version inmutable en orden contratada.
Moderation event: actor independiente, decisión approve/reject/suspend, motivo no vacío,
versión esperada y timestamp. Edición expectedVersion obsoleta no pisa datos.
Transiciones: draft→pending→approved/rejected; approved→suspended; edición crea nueva versión
que vuelve a validación antes de nuevas ventas. FK conserva referencias de órdenes previas.
