import test from "node:test";
import assert from "node:assert/strict";
import { setup } from "./helpers.js";
test("publish, moderate, version and suspend without exposing private drafts", async () => {
  const app = await setup();
  try {
    const dto = {
      name: "Oferta nueva",
      description: "Una revisión local con criterios y evidencia verificable.",
      profile: "reviewer",
      priceMinor: "200000",
    };
    assert.equal((await app.api("/offers", "POST", dto, "buyer")).status, 403);
    const created = await app.api(
      "/offers",
      "POST",
      dto,
      "provider",
      "offer-create-001",
    );
    assert.equal(created.status, 201);
    const offer = created.data;
    assert.deepEqual(
      (await app.api("/offers", "POST", dto, "provider", "offer-create-001"))
        .data,
      offer,
    );
    assert.equal(
      (
        await app.api(
          "/offers",
          "POST",
          { ...dto, name: "Otra oferta" },
          "provider",
          "offer-create-001",
        )
      ).status,
      409,
    );
    assert.equal(
      (await app.api(`/offers/${offer.id}`, "GET", undefined, "visitor"))
        .status,
      404,
    );
    assert.equal(
      (
        await app.api(
          `/offers/${offer.id}/submit`,
          "POST",
          { expectedVersion: 1 },
          "provider",
        )
      ).status,
      200,
    );
    assert.throws(
      () =>
        app.services.offers.moderate(
          {
            id: "provider",
            name: "Actor con conflicto",
            roles: ["provider", "admin"],
          },
          offer.id,
          {
            expectedVersion: 1,
            decision: "approve",
            reason: "Intento de autoaprobación.",
          },
        ),
      /propia oferta/,
    );
    assert.equal(
      (
        await app.api(
          `/offers/${offer.id}/moderate`,
          "POST",
          {
            expectedVersion: 1,
            decision: "approve",
            reason: "Perfil local verificado",
          },
          "admin",
        )
      ).status,
      200,
    );
    assert.equal(
      (await app.api(`/offers/${offer.id}`, "GET", undefined, "visitor"))
        .status,
      200,
    );
    assert.equal(
      (
        await app.api(
          `/offers/${offer.id}`,
          "PATCH",
          { expectedVersion: 0, name: "Cambio inválido" },
          "provider",
        )
      ).status,
      422,
    );
    const changed = await app.api(
      `/offers/${offer.id}`,
      "PATCH",
      { expectedVersion: 1, name: "Nueva versión local" },
      "provider",
    );
    assert.equal(changed.data.version, 2);
    assert.equal(changed.data.status, "draft");
    assert.equal(
      (
        await app.api(
          `/offers/${offer.id}`,
          "PATCH",
          { expectedVersion: 1, name: "Edición obsoleta" },
          "provider",
        )
      ).status,
      412,
    );
    assert.equal(
      (await app.api(`/offers/${offer.id}`, "GET", undefined, "visitor"))
        .status,
      404,
    );
    assert.equal(
      (
        await app.api(
          "/offers/offer-reviewer/moderate",
          "POST",
          {
            expectedVersion: 1,
            decision: "suspend",
            reason: "Retirada temporal del catálogo",
          },
          "admin",
        )
      ).status,
      200,
    );
    assert.equal(
      (await app.api("/offers/offer-reviewer", "GET", undefined, "visitor"))
        .status,
      404,
    );
  } finally {
    await app.close();
  }
});
