import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Job, Payment } from "@agentnexo/api-contracts";
import { setup } from "./helpers.js";
import { prepared, standardInput } from "./review-helpers.js";

test("input limits, private tool denial and edit invalidate acceptance", async () => {
  const app = await setup();
  try {
    for (const files of [
      [],
      Array(4).fill(standardInput.files[0]),
      [{ name: "../danger.ts", content: "x" }],
      [{ name: "file.zip", content: "x" }],
      [{ name: "file.ts", content: Array(1001).fill("x").join("\n") }],
      [{ name: "file.ts", content: "a".repeat(262145) }],
      [{ name: "file.ts", content: "\ud800" }],
    ])
      assert.notEqual(
        (await app.api("/jobs", "POST", { ...standardInput, files })).status,
        201,
      );
    let job = (await app.api("/jobs", "POST", standardInput)).data;
    const experimental = await app.api(`/jobs/${job.id}/policy`, "PUT", {
      expectedVersion: job.version,
      mode: "two-role-demo",
      modelLimitMinor: "1000000000",
      toolLimitMinor: "0",
      feeLimitMinor: "0",
      maxOperationMinor: "300000",
      allowTools: false,
    });
    assert.equal(experimental.status, 422);
    assert.equal(experimental.data.error.code, "PROFILE_NOT_APPLICABLE");
    assert.equal(
      (
        await app.api(`/jobs/${job.id}/policy`, "PUT", {
          expectedVersion: job.version,
          mode: "reviewer",
          modelLimitMinor: "1000000000",
          toolLimitMinor: "1",
          feeLimitMinor: "0",
          maxOperationMinor: "300000",
          allowTools: true,
        })
      ).status,
      422,
    );
    job = (
      await app.api(`/jobs/${job.id}/policy`, "PUT", {
        expectedVersion: job.version,
        mode: "reviewer",
        modelLimitMinor: "1000000000",
        toolLimitMinor: "0",
        feeLimitMinor: "0",
        maxOperationMinor: "300000",
        allowTools: false,
      })
    ).data.job;
    const policy = job.policy;
    job = (
      await app.api(`/jobs/${job.id}/authorizations`, "POST", {
        policyVersion: policy.version,
        policyDigest: policy.digest,
        accept: true,
      })
    ).data.job;
    const edited = await app.api(`/jobs/${job.id}`, "PATCH", {
      expectedVersion: job.version,
      objective: "Revisar ahora comparaciones y conversiones implícitas.",
    });
    assert.equal(edited.status, 200);
    assert.equal(edited.data.state, "draft");
    assert.equal(edited.data.authorizationId, undefined);
    assert.equal(
      (
        await app.api(`/jobs/${job.id}/authorizations`, "POST", {
          policyVersion: policy.version,
          policyDigest: policy.digest,
          accept: true,
        })
      ).status,
      409,
    );
    assert.equal(
      (await app.api(`/jobs/${job.id}`, "GET", undefined, "provider")).status,
      404,
    );
  } finally {
    await app.close();
  }
});
test("contract and start retries preserve one execution, report references and independent balances", async () => {
  const app = await setup();
  try {
    const { job, order } = await prepared(app);
    assert.equal(
      (await app.api(`/orders/${order.id}/start`, "POST", {})).status,
      409,
    );
    await app.api(
      `/orders/${order.id}/fund`,
      "POST",
      {},
      "buyer",
      "fund-idempotent-key",
    );
    await app.api(
      `/orders/${order.id}/fund`,
      "POST",
      {},
      "buyer",
      "fund-idempotent-key",
    );
    const request = () =>
      app.api(
        `/orders/${order.id}/start`,
        "POST",
        {},
        "buyer",
        "start-idempotent-key",
      );
    assert.equal((await request()).status, 202);
    await request();
    await app.services.execution.executeAll(job.id);
    await app.services.execution.executeAll(job.id);
    assert.equal(app.services.budgets.list(job.id).length, 1);
    const report = (await app.api(`/jobs/${job.id}/report`)).data;
    assert.equal(report.status, "complete");
    assert.equal(report.findings[0].fileName, "quantity.ts");
    assert.equal(report.findings[0].startLine, 1);
    assert.ok(report.findings[0].evidence.includes("n == 1"));
    assert.equal(report.testCases[0].executed, false);
    const json = (await app.api(`/jobs/${job.id}/report/download?format=json`))
      .data;
    assert.deepEqual(json, report);
    assert.ok(
      (
        await app.api(`/jobs/${job.id}/report/download?format=markdown`)
      ).data.includes("quantity.ts:1"),
    );
    const buckets = (await app.api(`/jobs/${job.id}/budget`)).data.buckets;
    assert.equal(buckets.length, 4);
    assert.equal(
      buckets.find((bucket: any) => bucket.category === "models").confirmed,
      "10000000",
    );
    assert.equal(
      buckets.find((bucket: any) => bucket.category === "tools").confirmed,
      "0",
    );
    assert.equal(
      buckets.find((bucket: any) => bucket.category === "contract").reserved,
      "200000",
    );
    assert.equal(
      (
        await app.api(`/jobs/${job.id}`, "PATCH", {
          expectedVersion: job.version,
          title: "Cambio prohibido",
        })
      ).status,
      409,
    );
    assert.equal(
      (await app.api(`/orders/${order.id}`, "GET", undefined, "provider"))
        .status,
      200,
    );
    assert.equal(
      (await app.api(`/jobs/${job.id}/report`, "GET", undefined, "provider"))
        .status,
      404,
    );
  } finally {
    await app.close();
  }
});
test("real SQLite reservation competition, operation cap and preserved over-limit charge", async () => {
  const app = await setup();
  try {
    const { job, order } = await prepared(app, true, "500000");
    await app.api(`/orders/${order.id}/fund`, "POST", {});
    await app.api(`/orders/${order.id}/start`, "POST", {});
    const current = app.services.jobs.internal(job.id);
    const results = await Promise.all([
      Promise.resolve().then(() =>
        app.services.budgets.reserve(
          current,
          "service-a",
          "analyst",
          "tool",
          "300000",
          "race-a",
        ),
      ),
      Promise.resolve().then(() =>
        app.services.budgets.reserve(
          current,
          "service-b",
          "test-designer",
          "tool",
          "300000",
          "race-b",
        ),
      ),
    ]);
    assert.equal(
      results.filter((operation) => operation.financialState === "reserved")
        .length,
      1,
    );
    assert.equal(
      results.filter((operation) => operation.financialState === "rejected")
        .length,
      1,
    );
    const winning = results.find(
      (operation) => operation.financialState === "reserved",
    )!;
    app.services.budgets.confirm(winning.id);
    const tool = app.services.budgets
      .view(current)
      .buckets.find((bucket) => bucket.category === "tools")!;
    assert.equal(tool.confirmed, "300000");
    assert.equal(tool.reserved, "0");
    assert.equal(tool.available, "200000");
    assert.equal(
      app.services.budgets.reserve(
        current,
        winning.providerId,
        winning.role,
        "tool",
        "300000",
        winning.logicalKey,
      ).id,
      winning.id,
    );
    assert.throws(
      () =>
        app.services.budgets.reserve(
          current,
          winning.providerId,
          winning.role,
          "tool",
          "300001",
          winning.logicalKey,
        ),
      /otra entrada/,
    );
    const capped = app.services.budgets.reserve(
      current,
      "service-a",
      "analyst",
      "tool",
      "400000",
      "cap-operation",
    );
    assert.equal(capped.reason, "OPERATION_LIMIT_EXCEEDED");
    const model = app.services.budgets.reserve(
      current,
      "local-reviewer",
      "analyst",
      "model",
      "10000000",
      "over-limit-model",
    );
    app.services.budgets.confirm(model.id, "available", "1200000000");
    const modelBucket = app.services.budgets.view(current).buckets[0];
    assert.equal(modelBucket.confirmed, "1200000000");
    assert.equal(modelBucket.deficit, "200000000");
    assert.equal(modelBucket.available, "0");
    assert.equal(
      app.services.budgets.reserve(
        current,
        "local-reviewer",
        "test-designer",
        "model",
        "1",
        "after-deficit",
      ).financialState,
      "rejected",
    );
    assert.throws(() => app.store.remove("job", job.id), /FOREIGN KEY/);
    assert.throws(
      () =>
        app.store.db
          .prepare("UPDATE financial_operations SET job_id=? WHERE id=?")
          .run("nonexistent-job", model.id),
      /FOREIGN KEY/,
    );
  } finally {
    await app.close();
  }
});
test("uncertain and paid-without-delivery survive restart and recover same operations", async () => {
  const directory = mkdtempSync(join(tmpdir(), "agentnexo-recovery-"));
  const path = join(directory, "state.sqlite");
  let app = await setup({ dbPath: path });
  try {
    const { job, order } = await prepared(app, true, "600000", {
      serviceA: "uncertain",
      serviceB: "delivery_failed",
    });
    await app.api(`/orders/${order.id}/fund`, "POST", {});
    await app.api(`/orders/${order.id}/start`, "POST", {});
    await app.services.execution.executeAll(job.id);
    let payments = app.services.budgets.list(job.id);
    const uncertain = payments.find(
      (payment) => payment.providerId === "service-a",
    )!;
    const failedDelivery = payments.find(
      (payment) => payment.providerId === "service-b",
    )!;
    assert.equal(uncertain.financialState, "uncertain");
    assert.equal(failedDelivery.financialState, "confirmed");
    assert.equal(failedDelivery.deliveryState, "failed");
    assert.equal(
      app.services.budgets.view(app.services.jobs.internal(job.id)).buckets[1]
        .reserved,
      "300000",
    );
    const partial = (await app.api(`/jobs/${job.id}/report`)).data;
    assert.equal(partial.status, "partial");
    assert.ok(
      !partial.testCases.some((item: any) => item.title.includes("Catálogo B")),
    );
    await app.close();
    app = await setup({ dbPath: path });
    await app.services.execution.executeAll(job.id);
    assert.equal(app.services.budgets.list(job.id).length, payments.length);
    assert.equal(
      (
        await app.api(
          `/jobs/${job.id}/payments/${uncertain.id}/reconcile`,
          "POST",
          { outcome: "confirmed", reason: "Evidencia local de cargo único" },
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await app.api(
          `/jobs/${job.id}/payments/${failedDelivery.id}/recover-delivery`,
          "POST",
          {},
        )
      ).status,
      200,
    );
    payments = app.services.budgets.list(job.id);
    assert.equal(payments.length, 4);
    assert.equal(
      app.services.budgets.view(app.services.jobs.internal(job.id)).buckets[1]
        .confirmed,
      "600000",
    );
    assert.equal(
      app.services.budgets.view(app.services.jobs.internal(job.id)).buckets[1]
        .reserved,
      "0",
    );
    const recovered = (await app.api(`/jobs/${job.id}/report`)).data;
    assert.equal(recovered.status, "complete");
    assert.ok(
      recovered.testCases.some((item: any) =>
        item.title.includes("Catálogo B"),
      ),
    );
  } finally {
    await app.close();
    rmSync(directory, { recursive: true });
  }
});
test("cancel stops dispatch and capacity rejects the eleventh order before funding", async () => {
  const app = await setup();
  try {
    const first = await prepared(app);
    await app.api(`/orders/${first.order.id}/fund`, "POST", {});
    await app.api(`/orders/${first.order.id}/start`, "POST", {});
    await app.api(`/orders/${first.order.id}/cancel`, "POST", {
      reason: "Detener antes de ejecutar",
    });
    await app.services.execution.executeAll(first.job.id);
    assert.equal(app.services.budgets.list(first.job.id).length, 0);
    for (let index = 0; index < 9; index++) await prepared(app);
    let job = (await app.api("/jobs", "POST", standardInput)).data;
    job = (
      await app.api(`/jobs/${job.id}/policy`, "PUT", {
        expectedVersion: job.version,
        mode: "reviewer",
        modelLimitMinor: "1000000000",
        toolLimitMinor: "0",
        feeLimitMinor: "0",
        maxOperationMinor: "300000",
        allowTools: false,
      })
    ).data.job;
    const auth = (
      await app.api(`/jobs/${job.id}/authorizations`, "POST", {
        policyVersion: job.policy.version,
        policyDigest: job.policy.digest,
        accept: true,
      })
    ).data;
    const eleventh = await app.api("/orders", "POST", {
      jobId: job.id,
      offerId: "offer-reviewer",
      offerVersion: 1,
      authorizationId: auth.authorizationId,
    });
    assert.equal(eleventh.status, 409);
    assert.equal(eleventh.data.error.code, "CAPACITY_EXCEEDED");
    assert.equal(app.store.list("order").length, 10);
  } finally {
    await app.close();
  }
});
test("persistent running checkpoint resumes through the actual dispatcher without resetting deadline", async () => {
  const directory = mkdtempSync(join(tmpdir(), "agentnexo-dispatch-"));
  const path = join(directory, "state.sqlite");
  let app = await setup({
    dbPath: path,
    autoDispatch: true,
    dispatchDelayMs: 2000,
  });
  try {
    const { job, order } = await prepared(app);
    await app.api(`/orders/${order.id}/fund`, "POST", {});
    await app.api(`/orders/${order.id}/start`, "POST", {});
    await new Promise((resolve) => setTimeout(resolve, 180));
    const task = app.store.list<{ state: string; deadline: string }>("task")[0];
    assert.equal(task.state, "running");
    await app.close();
    app = await setup({
      dbPath: path,
      autoDispatch: true,
      dispatchDelayMs: 20,
    });
    const deadline = Date.now() + 2000;
    while (
      app.services.jobs.internal(job.id).state !== "completed" &&
      Date.now() < deadline
    )
      await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(app.services.jobs.internal(job.id).state, "completed");
    assert.equal(
      app.store.list<{ deadline: string }>("task")[0].deadline,
      task.deadline,
    );
    assert.equal(app.services.budgets.list(job.id).length, 1);
    assert.equal(
      app.services.orders.internal(order.id).escrowState,
      "delivered",
    );
  } finally {
    await app.close();
    rmSync(directory, { recursive: true });
  }
});
