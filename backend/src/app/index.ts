import express from "express";
import type { ErrorRequestHandler } from "express";
import { fileURLToPath } from "node:url";
import { Store, ACTORS } from "../shared/database/store.js";
import { actorFor } from "../modules/context/context.js";
import { AppError } from "../shared/errors.js";
import { OfferService } from "../modules/offers/services/offer.service.js";
import { offersController } from "../modules/offers/controllers/offer.controller.js";
import { JobService } from "../modules/jobs/job.service.js";
import { BudgetService } from "../modules/budgets/budget.service.js";
import { OrderService } from "../modules/orders/order.service.js";
import { ReportService } from "../modules/reports/report.service.js";
import { ExecutionService } from "../modules/execution/execution.service.js";
import { jobsController } from "../modules/jobs/job.controller.js";
import { ordersController } from "../modules/orders/order.controller.js";
import { notificationsController } from "../modules/notifications/notification.controller.js";
import { operationsController } from "../modules/operations/operations.controller.js";
import { PROVIDERS } from "../modules/providers/provider.service.js";

export interface AppOptions {
  dbPath?: string;
  clock?: () => Date;
  autoDispatch?: boolean;
  dispatchDelayMs?: number;
}
export function createApp(options: AppOptions = {}) {
  const store = new Store(
    options.dbPath ??
      process.env.DB_PATH ??
      fileURLToPath(
        new URL("../../../.local/agentnexo.sqlite", import.meta.url),
      ),
    options.clock,
  );
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "512kb" }));
  app.use("/api/v1", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      actorFor(req);
      next();
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/v1/health", (_req, res) =>
    res.json({ status: "ok", mode: "local-demo", simulation: true }),
  );
  app.get("/api/v1/context", (_req, res) =>
    res.json({ actors: ACTORS, mode: "local-demo", simulation: true }),
  );
  const offers = new OfferService(store);
  app.use("/api/v1", offersController(store, offers));
  const jobs = new JobService(store);
  const budgets = new BudgetService(store);
  const reports = new ReportService(store);
  const orders = new OrderService(store, jobs, offers);
  const execution = new ExecutionService(
    store,
    jobs,
    budgets,
    reports,
    orders,
    options.dispatchDelayMs,
  );
  orders.onStart = (job) => execution.queue(job);
  app.get("/api/v1/providers", (_req, res) => res.json({ items: PROVIDERS }));
  app.use("/api/v1", jobsController(store, jobs, budgets, reports, execution));
  app.use("/api/v1", ordersController(store, orders));
  app.use("/api/v1", notificationsController(store));
  app.use("/api/v1", operationsController(store, budgets));
  if (options.autoDispatch !== false) execution.start();
  app.use((_req, _res, next) =>
    next(new AppError(404, "NOT_FOUND", "La ruta no existe.")),
  );
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof AppError) {
      res
        .status(error.status)
        .json({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
      return;
    }
    const code = (error as { type?: string; code?: string }).type;
    if (code === "entity.too.large") {
      res
        .status(413)
        .json({
          error: {
            code: "INPUT_TOO_LARGE",
            message: "La entrada excede el límite permitido.",
          },
        });
      return;
    }
    if (error instanceof SyntaxError) {
      res
        .status(400)
        .json({
          error: {
            code: "INVALID_JSON",
            message: "El cuerpo JSON no es válido.",
          },
        });
      return;
    }
    console.error(
      "Local API error:",
      error instanceof Error ? error.message : "unknown",
    );
    res
      .status(500)
      .json({
        error: {
          code: "INTERNAL_ERROR",
          message: "No se pudo completar la acción local.",
        },
      });
  };
  app.use(errors);
  return {
    app,
    store,
    services: { offers, jobs, budgets, orders, reports, execution },
    close: () => {
      execution.stop();
      store.close();
    },
  };
}
