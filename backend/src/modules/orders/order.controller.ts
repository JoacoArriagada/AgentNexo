import { Router } from "express";
import { z } from "zod";
import { Store } from "../../shared/database/store.js";
import { mutation, param, parse } from "../../shared/http.js";
import { actorFor } from "../context/context.js";
import { OrderService } from "./order.service.js";
const reason = z.string().trim().min(3).max(1000);
export function ordersController(store: Store, orders: OrderService) {
  const router = Router();
  router.get("/orders", (req, res) =>
    res.json({ items: orders.list(actorFor(req)) }),
  );
  router.get("/orders/:id", (req, res) =>
    res.json(orders.get(actorFor(req), param(req, "id"))),
  );
  router.post("/orders", (req, res) =>
    mutation(
      store,
      req,
      res,
      () =>
        orders.create(
          actorFor(req),
          parse(
            z
              .object({
                jobId: z.string(),
                offerId: z.string(),
                offerVersion: z.number().int().positive(),
                authorizationId: z.string(),
              })
              .strict(),
            req.body,
          ),
        ),
      201,
    ),
  );
  router.post("/orders/:id/fund", (req, res) =>
    mutation(store, req, res, () => {
      parse(z.object({}).strict(), req.body ?? {});
      return orders.fund(actorFor(req), param(req, "id"));
    }),
  );
  router.post("/orders/:id/start", (req, res) =>
    mutation(
      store,
      req,
      res,
      () => {
        parse(z.object({}).strict(), req.body ?? {});
        return orders.start(actorFor(req), param(req, "id"));
      },
      202,
    ),
  );
  router.post("/orders/:id/cancel", (req, res) =>
    mutation(store, req, res, () =>
      orders.cancel(
        actorFor(req),
        param(req, "id"),
        parse(
          z.object({ reason: z.string().trim().max(300).optional() }).strict(),
          req.body ?? {},
        ).reason,
      ),
    ),
  );
  router.post("/orders/:id/accept", (req, res) =>
    mutation(store, req, res, () => {
      parse(z.object({}).strict(), req.body ?? {});
      return orders.accept(actorFor(req), param(req, "id"));
    }),
  );
  router.post("/orders/:id/dispute", (req, res) =>
    mutation(store, req, res, () => {
      const dto = parse(
        z
          .object({ reason, evidence: z.string().trim().min(1).max(4000) })
          .strict(),
        req.body,
      );
      return orders.dispute(
        actorFor(req),
        param(req, "id"),
        dto.reason,
        dto.evidence,
      );
    }),
  );
  router.post("/orders/:id/respond", (req, res) =>
    mutation(store, req, res, () =>
      orders.respond(
        actorFor(req),
        param(req, "id"),
        parse(
          z.object({ response: z.string().trim().min(3).max(4000) }).strict(),
          req.body,
        ).response,
      ),
    ),
  );
  router.post("/orders/:id/resolve", (req, res) =>
    mutation(store, req, res, () => {
      const dto = parse(
        z.object({ outcome: z.enum(["pay", "refund"]), reason }).strict(),
        req.body,
      );
      return orders.resolve(
        actorFor(req),
        param(req, "id"),
        dto.outcome,
        dto.reason,
      );
    }),
  );
  router.post("/orders/:id/renounce", (req, res) =>
    mutation(store, req, res, () =>
      orders.renounce(
        actorFor(req),
        param(req, "id"),
        parse(z.object({ reason }).strict(), req.body).reason,
      ),
    ),
  );
  router.post("/orders/:id/claim", (req, res) =>
    mutation(store, req, res, () =>
      orders.claim(
        actorFor(req),
        param(req, "id"),
        parse(
          z
            .object({
              kind: z.enum([
                "no_start",
                "no_delivery",
                "silence",
                "unresolved",
              ]),
            })
            .strict(),
          req.body,
        ).kind,
      ),
    ),
  );
  router.get("/sales", (req, res) => res.json(orders.sales(actorFor(req))));
  return router;
}
