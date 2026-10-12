import assert from "node:assert/strict";
import { PUBLIC_DEMO_FILES } from "@agentnexo/api-contracts";
import type { setup } from "./helpers.js";
type TestApp = Awaited<ReturnType<typeof setup>>;
export const standardInput = {
  title: "Revisión de cantidad",
  objective: "Revisar casos límite de los cálculos numéricos del módulo.",
  acceptanceCriteria: [
    "Hallazgos con archivo y líneas",
    "Casos de prueba propuestos",
  ],
  files: [
    {
      name: "quantity.ts",
      content: "export const valid = (n: number) => n == 1;\n",
    },
  ],
};
export async function prepared(
  app: TestApp,
  publicDemo = false,
  toolLimitMinor = "600000",
  scenario?: { serviceA?: string; serviceB?: string },
) {
  const created = await app.api(
    "/jobs",
    "POST",
    publicDemo
      ? { ...standardInput, context: "public-demo", files: PUBLIC_DEMO_FILES }
      : standardInput,
  );
  assert.equal(created.status, 201, JSON.stringify(created.data));
  let job = created.data;
  const policy = await app.api(`/jobs/${job.id}/policy`, "PUT", {
    expectedVersion: job.version,
    mode: publicDemo ? "two-role-demo" : "reviewer",
    modelLimitMinor: "1000000000",
    toolLimitMinor: publicDemo ? toolLimitMinor : "0",
    feeLimitMinor: publicDemo ? "1000000" : "0",
    maxOperationMinor: "300000",
    allowTools: publicDemo,
  });
  assert.equal(policy.status, 200, JSON.stringify(policy.data));
  job = policy.data.job;
  const authorized = await app.api(`/jobs/${job.id}/authorizations`, "POST", {
    policyVersion: job.policy.version,
    policyDigest: job.policy.digest,
    accept: true,
  });
  assert.equal(authorized.status, 201);
  job = authorized.data.job;
  if (scenario)
    assert.equal(
      (await app.api(`/jobs/${job.id}/demo-scenario`, "POST", scenario)).status,
      200,
    );
  const contracted = await app.api("/orders", "POST", {
    jobId: job.id,
    offerId: publicDemo ? "offer-two-role" : "offer-reviewer",
    offerVersion: 1,
    authorizationId: authorized.data.authorizationId,
  });
  assert.equal(contracted.status, 201, JSON.stringify(contracted.data));
  return { job, order: contracted.data };
}
export async function delivered(app: TestApp) {
  const result = await prepared(app);
  assert.equal(
    (await app.api(`/orders/${result.order.id}/fund`, "POST", {})).status,
    200,
  );
  assert.equal(
    (await app.api(`/orders/${result.order.id}/start`, "POST", {})).status,
    202,
  );
  await app.services.execution.executeAll(result.job.id);
  return {
    job: (await app.api(`/jobs/${result.job.id}`)).data,
    order: (await app.api(`/orders/${result.order.id}`)).data,
  };
}
