import test from "node:test";
import assert from "node:assert/strict";
import { setup } from "./helpers.js";
import { delivered, prepared } from "./review-helpers.js";

test("T1/T3/T5 paid once, T7/T8 dispute response arbitration and T9 renunciation", async () => {
  const app = await setup();
  try {
    const first = await delivered(app);
    assert.equal(first.order.escrowState, "delivered");
    assert.equal(first.job.state, "completed");
    const before = (await app.api(`/jobs/${first.job.id}/budget`)).data
      .buckets[0].confirmed;
    const accepted = await app.api(
      `/orders/${first.order.id}/accept`,
      "POST",
      {},
      "buyer",
      "accept-once-local",
    );
    assert.equal(accepted.data.escrowState, "paid");
    assert.deepEqual(
      (
        await app.api(
          `/orders/${first.order.id}/accept`,
          "POST",
          {},
          "buyer",
          "accept-once-local",
        )
      ).data,
      accepted.data,
    );
    assert.equal(
      (
        await app.api(
          `/orders/${first.order.id}/renounce`,
          "POST",
          { reason: "Intento contradictorio" },
          "provider",
        )
      ).status,
      409,
    );
    assert.equal(
      (await app.api(`/jobs/${first.job.id}/budget`)).data.buckets[0].confirmed,
      before,
    );
    const second = await delivered(app);
    const disputed = await app.api(
      `/orders/${second.order.id}/dispute`,
      "POST",
      {
        reason: "Solicito revisar los límites",
        evidence: "El criterio requerido no se evaluó automáticamente.",
      },
    );
    assert.equal(disputed.data.escrowState, "disputed");
    assert.equal(
      (
        await app.api(
          `/orders/${second.order.id}/resolve`,
          "POST",
          { outcome: "pay", reason: "Quiero resolver mi propia venta" },
          "provider",
        )
      ).status,
      403,
    );
    assert.throws(
      () =>
        app.services.orders.resolve(
          { id: "other-admin", name: "Otro administrador", roles: ["admin"] },
          second.order.id,
          "pay",
          "Árbitro no asignado.",
        ),
      /asignado/,
    );
    assert.throws(
      () =>
        app.services.orders.resolve(
          {
            id: "provider",
            name: "Proveedor y administrador",
            roles: ["provider", "admin"],
          },
          second.order.id,
          "pay",
          "Autoarbitraje.",
        ),
      /asignado/,
    );
    assert.equal(
      (
        await app.api(
          `/orders/${second.order.id}/respond`,
          "POST",
          { response: "Las limitaciones del análisis están identificadas." },
          "provider",
        )
      ).status,
      200,
    );
    const resolved = await app.api(
      `/orders/${second.order.id}/resolve`,
      "POST",
      {
        outcome: "refund",
        reason: "Devolución total por criterio no evaluado.",
      },
      "admin",
    );
    assert.equal(resolved.data.escrowState, "refunded");
    assert.equal(
      (
        await app.api(
          `/orders/${second.order.id}/respond`,
          "POST",
          { response: "Nueva evidencia después del cierre." },
          "provider",
        )
      ).status,
      409,
    );
    const third = await delivered(app);
    const renounced = await app.api(
      `/orders/${third.order.id}/renounce`,
      "POST",
      { reason: "Renuncia voluntaria del proveedor." },
      "provider",
    );
    assert.equal(renounced.data.escrowState, "refunded");
    const fourth = await delivered(app);
    await app.api(`/orders/${fourth.order.id}/dispute`, "POST", {
      reason: "Revisión de evidencia",
      evidence: "Aportar antecedentes antes de resolver.",
    });
    assert.equal(
      (
        await app.api(
          `/orders/${fourth.order.id}/resolve`,
          "POST",
          {
            outcome: "pay",
            reason: "Evidencia de entrega conforme en simulación.",
          },
          "admin",
        )
      ).data.escrowState,
      "paid",
    );
    assert.equal(app.store.list("closure").length, 4);
    const sales = (await app.api("/sales", "GET", undefined, "provider")).data;
    assert.equal(sales.items.length, 4);
    assert.equal(sales.totals[0].paid, "400000");
    assert.equal(sales.totals[0].refunded, "400000");
    assert.equal(JSON.stringify(sales).includes("n == 1"), false);
  } finally {
    await app.close();
  }
});
test("T2/T4/T6/T10 exact deadline boundaries and persisted times", async () => {
  let now = new Date("2026-10-12T12:00:00Z");
  const app = await setup({ clock: () => now });
  try {
    const noStart = await prepared(app);
    const funded = (
      await app.api(`/orders/${noStart.order.id}/fund`, "POST", {})
    ).data;
    now = new Date(Date.parse(funded.startDeadline) - 1);
    assert.equal(
      (
        await app.api(`/orders/${noStart.order.id}/claim`, "POST", {
          kind: "no_start",
        })
      ).status,
      409,
    );
    now = new Date(funded.startDeadline);
    assert.equal(
      (await app.api(`/orders/${noStart.order.id}/start`, "POST", {})).status,
      409,
    );
    assert.equal(
      (
        await app.api(`/orders/${noStart.order.id}/claim`, "POST", {
          kind: "no_start",
        })
      ).data.escrowState,
      "refunded",
    );
    const noDelivery = await prepared(app);
    await app.api(`/orders/${noDelivery.order.id}/fund`, "POST", {});
    const started = (
      await app.api(`/orders/${noDelivery.order.id}/start`, "POST", {})
    ).data.order;
    now = new Date(Date.parse(started.deliveryDeadline) - 1);
    assert.equal(
      (
        await app.api(`/orders/${noDelivery.order.id}/claim`, "POST", {
          kind: "no_delivery",
        })
      ).status,
      409,
    );
    now = new Date(started.deliveryDeadline);
    assert.equal(
      (
        await app.api(`/orders/${noDelivery.order.id}/claim`, "POST", {
          kind: "no_delivery",
        })
      ).data.escrowState,
      "refunded",
    );
    const silence = await delivered(app);
    now = new Date(Date.parse(silence.order.acceptanceDeadline) - 1);
    assert.equal(
      (
        await app.api(`/orders/${silence.order.id}/claim`, "POST", {
          kind: "silence",
        })
      ).status,
      409,
    );
    now = new Date(silence.order.acceptanceDeadline);
    assert.equal(
      (await app.api(`/orders/${silence.order.id}/accept`, "POST", {})).status,
      409,
    );
    assert.equal(
      (
        await app.api(
          `/orders/${silence.order.id}/claim`,
          "POST",
          { kind: "silence" },
          "provider",
        )
      ).data.escrowState,
      "paid",
    );
    const unresolved = await delivered(app);
    const dispute = (
      await app.api(`/orders/${unresolved.order.id}/dispute`, "POST", {
        reason: "Criterio no cubierto",
        evidence: "La evaluación no cubre negocio.",
      })
    ).data;
    now = new Date(Date.parse(dispute.disputeDeadline) - 1);
    assert.equal(
      (
        await app.api(`/orders/${unresolved.order.id}/claim`, "POST", {
          kind: "unresolved",
        })
      ).status,
      409,
    );
    now = new Date(dispute.disputeDeadline);
    assert.equal(
      (
        await app.api(
          `/orders/${unresolved.order.id}/resolve`,
          "POST",
          { outcome: "pay", reason: "Intento pasado el plazo" },
          "admin",
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await app.api(`/orders/${unresolved.order.id}/claim`, "POST", {
          kind: "unresolved",
        })
      ).data.escrowState,
      "refunded",
    );
    assert.equal(
      app.services.orders.internal(unresolved.order.id).disputeDeadline,
      dispute.disputeDeadline,
    );
  } finally {
    await app.close();
  }
});
test("operation pause blocks new commitments but permits closure; notices and settings preserve money", async () => {
  const app = await setup();
  try {
    const first = await delivered(app);
    const before = (await app.api(`/jobs/${first.job.id}/budget`)).data;
    assert.equal(
      (
        await app.api(
          "/operations/control",
          "POST",
          {
            admissionPaused: true,
            spendingPaused: true,
            reason: "Pausa operativa de demostración.",
          },
          "buyer",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await app.api(
          "/operations/control",
          "POST",
          {
            admissionPaused: true,
            spendingPaused: true,
            reason: "Pausa operativa de demostración.",
          },
          "admin",
        )
      ).status,
      200,
    );
    assert.equal(
      (await app.api(`/orders/${first.order.id}/accept`, "POST", {})).status,
      200,
    );
    const notices = (await app.api("/notifications")).data.items;
    assert.ok(notices.length > 0);
    assert.equal(
      (
        await app.api(
          `/notifications/${notices[0].id}`,
          "PATCH",
          { read: true },
          "provider",
        )
      ).status,
      404,
    );
    assert.equal(
      (await app.api("/notifications/read-all", "POST", {})).status,
      200,
    );
    assert.equal(
      (
        await app.api("/preferences", "PATCH", {
          timezone: "America/Santiago",
          notificationsEnabled: false,
        })
      ).status,
      200,
    );
    assert.equal(
      (await app.api(`/jobs/${first.job.id}/budget`)).data.buckets[0].confirmed,
      before.buckets[0].confirmed,
    );
    assert.equal(
      (await app.api(`/jobs/${first.job.id}/archive`, "POST", {})).status,
      200,
    );
    assert.equal((await app.api("/jobs")).data.items.length, 0);
    assert.equal(
      (await app.api(`/jobs/${first.job.id}/unarchive`, "POST", {})).status,
      200,
    );
    assert.equal(
      (await app.api(`/jobs/${first.job.id}/content`, "DELETE", {})).status,
      200,
    );
    assert.equal((await app.api(`/jobs/${first.job.id}/report`)).status, 409);
    assert.equal(app.services.budgets.list(first.job.id).length, 1);
  } finally {
    await app.close();
  }
});
