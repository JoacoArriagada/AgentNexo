import { Router } from "express";
import { z } from "zod";
import { Store } from "../../../shared/database/store.js";
import { mutation, param, parse } from "../../../shared/http.js";
import { actorFor, requireRole } from "../../context/context.js";
import { offerDto, editOfferDto, moderationDto } from "../dto/offer.dto.js";
import { OfferService } from "../services/offer.service.js";
export function offersController(store: Store, service: OfferService) {
  const router = Router();
  router.get("/offers", (req, res) =>
    res.json({
      items: service.list(
        actorFor(req),
        String(req.query.search ?? ""),
        String(req.query.profile ?? ""),
      ),
    }),
  );
  router.get("/offers/:id", (req, res) =>
    res.json(service.get(actorFor(req), param(req, "id"))),
  );
  router.post("/offers", (req, res) =>
    mutation(
      store,
      req,
      res,
      () => service.create(actorFor(req), parse(offerDto, req.body)),
      201,
    ),
  );
  router.patch("/offers/:id", (req, res) =>
    mutation(store, req, res, () =>
      service.edit(
        actorFor(req),
        param(req, "id"),
        parse(editOfferDto, req.body),
      ),
    ),
  );
  router.post("/offers/:id/submit", (req, res) =>
    mutation(store, req, res, () =>
      service.submit(
        actorFor(req),
        param(req, "id"),
        parse(
          z.object({ expectedVersion: z.number().int().positive() }).strict(),
          req.body,
        ).expectedVersion,
      ),
    ),
  );
  router.get("/moderation", (req, res) => {
    requireRole(actorFor(req), "admin");
    res.json({
      items: service.repo
        .list()
        .filter((offer) => ["pending", "suspended"].includes(offer.status)),
    });
  });
  router.post("/offers/:id/moderate", (req, res) =>
    mutation(store, req, res, () =>
      service.moderate(
        actorFor(req),
        param(req, "id"),
        parse(moderationDto, req.body),
      ),
    ),
  );
  router.post("/offers/:id/withdraw", (req, res) =>
    mutation(store, req, res, () => {
      const dto = parse(
        z
          .object({
            expectedVersion: z.number().int().positive(),
            reason: z.string().trim().min(3).max(1000),
          })
          .strict(),
        req.body,
      );
      return service.withdraw(
        actorFor(req),
        param(req, "id"),
        dto.expectedVersion,
        dto.reason,
      );
    }),
  );
  return router;
}
