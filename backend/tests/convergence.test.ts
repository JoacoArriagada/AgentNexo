import test from "node:test";
import assert from "node:assert/strict";
import { setup } from "./helpers.js";
import { delivered, prepared, standardInput } from "./review-helpers.js";

test("content suppression redacts checkpoints and cached replies without enabling replay effects", async () => {
  const app = await setup();
  try {
    const { job, order } = await delivered(app);
    const original = app.store.db
      .prepare(
        "SELECT key FROM idempotency WHERE json_extract(response,'$.id')=? AND route LIKE 'POST %jobs'",
      )
      .get(job.id)!;
    assert.ok(original);
    await app.api(`/orders/${order.id}/accept`, "POST", {});
    assert.equal(
      (await app.api(`/jobs/${job.id}/content`, "DELETE", {})).status,
      200,
    );
    assert.equal(
      (
        await app.api(
          "/jobs",
          "POST",
          standardInput,
          "buyer",
          original.key as string,
        )
      ).status,
      410,
    );
    assert.equal(app.store.list("job").length, 1);
    assert.equal(app.services.jobs.internal(job.id).files.length, 0);
    assert.equal(
      app.store.list<{ findings?: unknown }>("task")[0].findings,
      undefined,
    );
    assert.ok(
      app.store.db
        .prepare("SELECT response FROM idempotency")
        .all()
        .every((row) => !(row.response as string).includes("n == 1")),
    );
    assert.ok(
      app.store.db
        .prepare("SELECT data FROM entities")
        .all()
        .every((row) => !(row.data as string).includes("n == 1")),
    );
    assert.equal(app.services.budgets.list(job.id).length, 1);
    app.services.execution.refreshReport(job.id);
    assert.equal((await app.api(`/jobs/${job.id}/report`)).status, 409);
  } finally {
    await app.close();
  }
});
test("file IDs are server generated and business criteria never pass from loose keyword matches", async () => {
  const app = await setup();
  try {
    const created = await app.api("/jobs", "POST", {
      ...standardInput,
      acceptanceCriteria: [
        "Ejecutar pruebas y no tener hallazgos altos",
        "sin hallazgos",
        "sin hallazgos de alta severidad",
        "Hallazgos con archivo y líneas",
      ],
      files: [
        {
          id: "same-client-id",
          name: "first.ts",
          content: "export const compare = (n: number) => n == 1;",
        },
        {
          id: "same-client-id",
          name: "second.ts",
          content: "export const run = (text: string) => eval(text);",
        },
      ],
    });
    assert.equal(created.status, 201);
    const job = created.data;
    assert.notEqual(job.files[0].id, "same-client-id");
    assert.notEqual(job.files[0].id, job.files[1].id);
    const findings = (
      await import("../src/modules/execution/analyzer.js")
    ).analyze(job);
    const report = app.services.reports.generate(job, findings, [], false);
    assert.equal(report.criteria[0].status, "no_evaluado");
    assert.equal(report.criteria[1].status, "no_sustentado");
    assert.equal(report.criteria[2].status, "no_sustentado");
    assert.equal(report.criteria[3].status, "sustentado");
    assert.ok(report.testCases.every((item) => item.executed === false));
    for (const finding of report.findings)
      assert.equal(
        job.files.find((file: any) => file.id === finding.fileId).name,
        finding.fileName,
      );
    const empty = app.services.reports.generate(
      { ...job, acceptanceCriteria: ["sin hallazgos"] },
      [],
      [],
      false,
    );
    assert.equal(empty.criteria[0].status, "no_evaluado");
  } finally {
    await app.close();
  }
});
test("unfunded cancellation moves zero; a deficit blocks spending across every bucket", async () => {
  const app = await setup();
  try {
    const first = await prepared(app);
    await app.api(`/orders/${first.order.id}/cancel`, "POST", {
      reason: "Cancelación sin financiación.",
    });
    const closure = app.store.get<{ amount: { minor: string } }>(
      "closure",
      first.order.id,
    )!;
    assert.equal(closure.amount.minor, "0");
    const second = await prepared(app, true);
    await app.api(`/orders/${second.order.id}/fund`, "POST", {});
    await app.api(`/orders/${second.order.id}/start`, "POST", {});
    const job = app.services.jobs.internal(second.job.id);
    const model = app.services.budgets.reserve(
      job,
      "local-reviewer",
      "analyst",
      "model",
      "10000000",
      "deficit-call",
    );
    app.services.budgets.confirm(model.id, "available", "1200000000");
    const tool = app.services.budgets.reserve(
      job,
      "service-a",
      "analyst",
      "tool",
      "300000",
      "tool-after-model-deficit",
    );
    assert.equal(tool.financialState, "rejected");
    assert.equal(tool.reason, "OVER_LIMIT");
    assert.equal(app.services.budgets.view(job).buckets[1].reserved, "0");
  } finally {
    await app.close();
  }
});
test("provider withdrawal prevents new orders while retaining earlier offer snapshots", async () => {
  const app = await setup();
  try {
    const first = await prepared(app);
    const snapshot = structuredClone(first.order.offer);
    const mismatch = await app.api("/orders", "POST", {
      jobId: first.job.id,
      offerId: "offer-two-role",
      offerVersion: 1,
      authorizationId: first.job.authorizationId,
    });
    assert.equal(mismatch.status, 422);
    assert.equal(mismatch.data.error.code, "PROFILE_MISMATCH");
    assert.equal(
      (
        await app.api(
          "/offers/offer-reviewer/withdraw",
          "POST",
          { expectedVersion: 1, reason: "Retirada temporal del catálogo." },
          "buyer",
        )
      ).status,
      403,
    );
    const withdrawn = await app.api(
      "/offers/offer-reviewer/withdraw",
      "POST",
      { expectedVersion: 1, reason: "Retirada temporal del catálogo." },
      "provider",
      "withdraw-once-key",
    );
    assert.equal(withdrawn.data.status, "suspended");
    assert.deepEqual(
      (
        await app.api(
          "/offers/offer-reviewer/withdraw",
          "POST",
          { expectedVersion: 1, reason: "Retirada temporal del catálogo." },
          "provider",
          "withdraw-once-key",
        )
      ).data,
      withdrawn.data,
    );
    assert.equal(
      (await app.api("/offers/offer-reviewer", "GET", undefined, "visitor"))
        .status,
      404,
    );
    assert.deepEqual(
      app.services.orders.internal(first.order.id).offer,
      snapshot,
    );
    assert.equal(
      (await app.api(`/orders/${first.order.id}/fund`, "POST", {})).status,
      200,
    );
    assert.equal(
      (await app.api(`/orders/${first.order.id}/start`, "POST", {})).status,
      202,
    );
  } finally {
    await app.close();
  }
});
test("budget amendment activates only on fresh acceptance, preserves original terms and committed spending", async () => {
  const app = await setup();
  try {
    const { job: initial, order } = await prepared(app, true, "500000");
    await app.api(`/orders/${order.id}/fund`, "POST", {});
    await app.api(`/orders/${order.id}/start`, "POST", {});
    let job = app.services.jobs.internal(initial.id);
    const originalOrder = structuredClone(
      app.services.orders.internal(order.id),
    );
    const first = app.services.budgets.reserve(
      job,
      "service-a",
      "analyst",
      "tool",
      "300000",
      "amendment-tool-a",
    );
    app.services.budgets.confirm(first.id);
    const input = {
      expectedVersion: job.version,
      modelLimitMinor: job.policy!.modelLimitMinor,
      toolLimitMinor: "600000",
      feeLimitMinor: job.policy!.feeLimitMinor,
      maxOperationMinor: job.policy!.maxOperationMinor,
    };
    assert.equal(
      (
        await app.api(
          `/jobs/${job.id}/policy/amendments`,
          "POST",
          input,
          "provider",
        )
      ).status,
      404,
    );
    const proposed = await app.api(
      `/jobs/${job.id}/policy/amendments`,
      "POST",
      input,
    );
    assert.equal(proposed.status, 200);
    assert.equal(proposed.data.job.policy.toolLimitMinor, "500000");
    assert.equal(proposed.data.policy.accepted, false);
    assert.equal(proposed.data.job.state, "queued");
    job = app.services.jobs.internal(job.id);
    assert.equal(app.services.budgets.view(job).buckets[1].available, "200000");
    const accepted = await app.api(`/jobs/${job.id}/authorizations`, "POST", {
      policyVersion: proposed.data.policy.version,
      policyDigest: proposed.data.policy.digest,
      accept: true,
    });
    assert.equal(accepted.status, 201);
    job = accepted.data.job;
    assert.equal(job.policy!.toolLimitMinor, "600000");
    assert.equal(job.state, "queued");
    assert.equal(app.services.budgets.view(job).buckets[1].available, "300000");
    const second = app.services.budgets.reserve(
      job,
      "service-b",
      "test-designer",
      "tool",
      "300000",
      "amendment-tool-b",
    );
    assert.equal(second.financialState, "reserved");
    app.services.budgets.confirm(second.id);
    assert.equal(app.services.budgets.view(job).buckets[1].confirmed, "600000");
    const unchanged = app.services.orders.internal(order.id);
    assert.deepEqual(unchanged.policy, originalOrder.policy);
    assert.deepEqual(unchanged.price, originalOrder.price);
    assert.equal(unchanged.startedAt, originalOrder.startedAt);
    assert.equal(unchanged.deliveryDeadline, originalOrder.deliveryDeadline);
    assert.equal(job.inputDigest, initial.inputDigest);
    assert.equal(
      (
        await app.api(`/jobs/${job.id}/policy/amendments`, "POST", {
          ...input,
          expectedVersion: job.version,
          toolLimitMinor: "400000",
        })
      ).status,
      422,
    );
    assert.equal(
      app.store.get<{ status: string }>("amendment", proposed.data.amendmentId)!
        .status,
      "accepted",
    );
  } finally {
    await app.close();
  }
});
