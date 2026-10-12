import { Router } from "express";
import { z } from "zod";
import type { Payment } from "@agentnexo/api-contracts";
import { Store } from "../../shared/database/store.js";
import { mutation, param, parse } from "../../shared/http.js";
import { ensure } from "../../shared/errors.js";
import { actorFor } from "../context/context.js";
import { JobService } from "./job.service.js";
import {
  authorizationDto,
  createJobDto,
  editJobDto,
  policyDto,
} from "./job.dto.js";
import { minor } from "../offers/dto/offer.dto.js";
import { BudgetService } from "../budgets/budget.service.js";
import { ReportService } from "../reports/report.service.js";
import { ExecutionService } from "../execution/execution.service.js";
export function jobsController(
  store: Store,
  jobs: JobService,
  budgets: BudgetService,
  reports: ReportService,
  execution: ExecutionService,
) {
  const router = Router();
  const owned = (req: Parameters<typeof actorFor>[0]) =>
    jobs.get(actorFor(req), param(req, "id"));
  router.get("/jobs", (req, res) =>
    res.json({
      items: jobs.list(actorFor(req), req.query.archived === "true"),
    }),
  );
  router.post("/jobs", (req, res) =>
    mutation(
      store,
      req,
      res,
      () => jobs.create(actorFor(req), parse(createJobDto, req.body)),
      201,
    ),
  );
  router.get("/jobs/:id", (req, res) => res.json(owned(req)));
  router.patch("/jobs/:id", (req, res) =>
    mutation(store, req, res, () =>
      jobs.edit(actorFor(req), param(req, "id"), parse(editJobDto, req.body)),
    ),
  );
  router.delete("/jobs/:id", (req, res) =>
    mutation(
      store,
      req,
      res,
      () =>
        jobs.remove(
          actorFor(req),
          param(req, "id"),
          parse(
            z.object({ expectedVersion: z.number().int().positive() }).strict(),
            req.body,
          ).expectedVersion,
        ),
      204,
    ),
  );
  router.put("/jobs/:id/policy", (req, res) =>
    mutation(store, req, res, () =>
      jobs.policy(actorFor(req), param(req, "id"), parse(policyDto, req.body)),
    ),
  );
  router.get("/jobs/:id/policy", (req, res) => {
    const job = owned(req);
    ensure(
      job.policy,
      409,
      "POLICY_NOT_READY",
      "La política todavía no existe.",
    );
    res.json(job.policy);
  });
  router.post("/jobs/:id/policy/amendments", (req, res) =>
    mutation(store, req, res, () =>
      jobs.amend(
        actorFor(req),
        param(req, "id"),
        parse(
          z
            .object({
              expectedVersion: z.number().int().positive(),
              modelLimitMinor: minor,
              toolLimitMinor: minor,
              feeLimitMinor: minor,
              maxOperationMinor: minor,
            })
            .strict(),
          req.body,
        ),
      ),
    ),
  );
  router.post("/jobs/:id/authorizations", (req, res) =>
    mutation(
      store,
      req,
      res,
      () =>
        jobs.authorize(
          actorFor(req),
          param(req, "id"),
          parse(authorizationDto, req.body),
        ),
      201,
    ),
  );
  router.get("/jobs/:id/events", (req, res) => {
    const job = owned(req);
    const after = Number(req.query.after ?? 0);
    ensure(
      Number.isSafeInteger(after) && after >= 0,
      400,
      "INVALID_CURSOR",
      "El cursor debe ser un entero no negativo.",
    );
    const items = store.events(job.id, after);
    res.json({ items, nextCursor: items.at(-1)?.sequence ?? after });
  });
  router.get("/jobs/:id/budget", (req, res) =>
    res.json(budgets.view(owned(req))),
  );
  router.get("/jobs/:id/payments", (req, res) =>
    res.json({ items: budgets.list(owned(req).id) }),
  );
  router.get("/jobs/:id/report", (req, res) =>
    res.json(reports.get(owned(req).id)),
  );
  router.get("/jobs/:id/report/download", (req, res) => {
    const report = reports.get(owned(req).id);
    const format = String(req.query.format ?? "markdown");
    ensure(
      ["markdown", "json"].includes(format),
      400,
      "INVALID_FORMAT",
      "Elige markdown o json.",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report-${report.jobId}.${format === "json" ? "json" : "md"}"`,
    );
    if (format === "json")
      res.type("application/json").send(JSON.stringify(report, null, 2));
    else
      res.type("text/markdown; charset=utf-8").send(reports.markdown(report));
  });
  router.post("/jobs/:id/archive", (req, res) =>
    mutation(store, req, res, () =>
      jobs.archive(actorFor(req), param(req, "id"), true),
    ),
  );
  router.post("/jobs/:id/unarchive", (req, res) =>
    mutation(store, req, res, () =>
      jobs.archive(actorFor(req), param(req, "id"), false),
    ),
  );
  router.delete("/jobs/:id/content", (req, res) =>
    mutation(store, req, res, () =>
      jobs.deleteContent(actorFor(req), param(req, "id")),
    ),
  );
  router.post("/jobs/:id/demo-scenario", (req, res) =>
    mutation(store, req, res, () => {
      const job = owned(req);
      ensure(
        !job.orderId,
        409,
        "INPUT_LOCKED",
        "Configura el escenario antes de contratar.",
      );
      const schema = z
        .object({
          serviceA: z
            .enum(["normal", "uncertain", "delivery_failed", "price_exceeded"])
            .optional(),
          serviceB: z
            .enum(["normal", "uncertain", "delivery_failed", "price_exceeded"])
            .optional(),
        })
        .strict();
      const dto = parse(schema, req.body);
      ensure(
        job.context === "public-demo",
        409,
        "TOOL_NOT_APPLICABLE",
        "Los escenarios A/B requieren el fixture público.",
      );
      store.save("scenario", { id: job.id, ...dto });
      return { jobId: job.id, ...dto, simulation: true };
    }),
  );
  router.post("/jobs/:id/payments/:operationId/reconcile", (req, res) =>
    mutation(store, req, res, () => {
      const actor = actorFor(req);
      const job = actor.roles.includes("admin")
        ? jobs.internal(param(req, "id"))
        : owned(req);
      const operation = budgets.get(param(req, "operationId"));
      ensure(
        operation && operation.jobId === job.id,
        404,
        "NOT_FOUND",
        "La operación no existe.",
      );
      ensure(
        operation.financialState === "uncertain",
        409,
        "INVALID_STATE",
        "La conciliación requiere una operación incierta.",
      );
      const dto = parse(
        z
          .object({
            outcome: z.enum(["confirmed", "failed"]),
            reason: z.string().trim().min(3).max(1000),
          })
          .strict(),
        req.body,
      );
      const result: Payment =
        dto.outcome === "confirmed"
          ? budgets.confirm(operation.id)
          : budgets.fail(operation.id, dto.reason);
      store.event(
        job.id,
        actor.id,
        "manual_reconciliation",
        `Evidencia de simulación local: ${dto.reason}`,
      );
      execution.refreshReport(job.id);
      return result;
    }),
  );
  router.post("/jobs/:id/payments/:operationId/recover-delivery", (req, res) =>
    mutation(store, req, res, () => {
      const job = owned(req);
      const operation = budgets.get(param(req, "operationId"));
      ensure(
        operation?.jobId === job.id,
        404,
        "NOT_FOUND",
        "La operación no existe.",
      );
      const result = budgets.recoverDelivery(operation.id);
      execution.refreshReport(job.id);
      return result;
    }),
  );
  return router;
}
