import { Router } from "express";
import { z } from "zod";
import type { Order, OperationsView } from "@agentnexo/api-contracts";
import { Store } from "../../shared/database/store.js";
import { mutation, parse } from "../../shared/http.js";
import { actorFor, requireRole } from "../context/context.js";
import { BudgetService } from "../budgets/budget.service.js";
export function operationsController(store: Store, budgets: BudgetService) {
  const router = Router();
  function view(): OperationsView {
    const config = store.get<{
      admissionPaused: boolean;
      spendingPaused: boolean;
    }>("config", "operation")!;
    const orders = store.list<Order>("order");
    return {
      ...config,
      capacity: 10,
      activeJobs: orders.filter(
        (order) => !["paid", "refunded"].includes(order.escrowState),
      ).length,
      pendingOperations: orders
        .flatMap((order) => budgets.list(order.jobId))
        .filter((operation) =>
          ["reserved", "prepared", "submitted", "uncertain"].includes(
            operation.financialState,
          ),
        ),
      disputes: orders.filter((order) => order.escrowState === "disputed"),
    };
  }
  router.get("/operations", (req, res) => {
    requireRole(actorFor(req), "admin");
    res.json(view());
  });
  router.post("/operations/control", (req, res) =>
    mutation(store, req, res, () => {
      const actor = actorFor(req);
      requireRole(actor, "admin");
      const dto = parse(
        z
          .object({
            admissionPaused: z.boolean().optional(),
            spendingPaused: z.boolean().optional(),
            reason: z.string().trim().min(3).max(1000),
          })
          .strict(),
        req.body,
      );
      const before = store.get<{
        id: string;
        admissionPaused: boolean;
        spendingPaused: boolean;
      }>("config", "operation")!;
      const { reason, ...flags } = dto;
      store.save("config", { ...before, ...flags });
      store.event(
        "operations",
        actor.id,
        "operation_control",
        `${JSON.stringify({ before, after: flags })}: ${reason}`,
      );
      return view();
    }),
  );
  return router;
}
