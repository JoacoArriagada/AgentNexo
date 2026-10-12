# Data model: Contratación y revisión

Job: id/version/buyerId/title 3–100/objective20–2000; criteria1–10 de hasta500;
files1–3 .js/.ts UTF-8, <=1000 líneas y <=262144 bytes combinados; inputDigest;
context private-review/public-demo, archived y estado draft/awaiting_authorization/ready/
queued/running/paused/completed/partial/cancelled/failed. Edición invalida aceptación.
Policy: version/digest/inputDigest/mode reviewer o two-role-demo, límites exactos,
allowTools, accepted; deadlines start30min/delivery15min/acceptance48h/dispute7d.
Authorization: job/policyVersion/digest/actor/timestamp; válida sólo snapshot sin cambios.
Order: snapshot Offer/Policy, job/buyer/provider/arbiterId, price exacto separado,
financing pending/confirmed/rejected/uncertain, escrow unfunded/funded/running/delivered/
disputed/paid/refunded; ejecución y entrega separadas, timestamps/plazos absolutos.
Capacity: reserva durable por orden, máximo10 antes fondos; liberar por cierre/expiración segura.
Task: job/role/state/calls<=4/retries<=1/deadline10min/checkpoint.
Operation: identidad única, category/currency/scale/amount, reserved/confirmed/uncertain/rejected,
deliveryState y receipt simulation=true; reintento misma identidad.
Budget: price/model/tool/fee separadas, authorized/reserved/confirmed/available/deficit exactos.
Report: job/version/status complete/partial, findings con referencias verificadas, tests executed=false,
criteria sustentado/no_sustentado/no_evaluado, contributions y limitations; MD/JSON mismo snapshot.
