import { Router } from "express";
import { z } from "zod";
import type { Notification, Preferences } from "@agentnexo/api-contracts";
import { Store } from "../../shared/database/store.js";
import { mutation, param, parse } from "../../shared/http.js";
import { ensure } from "../../shared/errors.js";
import { actorFor } from "../context/context.js";
export function notificationsController(store: Store) {
  const router = Router();
  const own = (actorId: string) => {
    ensure(
      actorId !== "visitor",
      403,
      "ROLE_REQUIRED",
      "Elige un actor privado.",
    );
    return store
      .list<Notification>("notification")
      .filter((item) => item.actorId === actorId);
  };
  router.get("/notifications", (req, res) => {
    let items = own(actorFor(req).id);
    if (req.query.unread === "true") items = items.filter((item) => !item.read);
    res.json({ items });
  });
  router.patch("/notifications/:id", (req, res) =>
    mutation(store, req, res, () => {
      parse(z.object({ read: z.literal(true) }).strict(), req.body);
      const notice = own(actorFor(req).id).find(
        (item) => item.id === param(req, "id"),
      );
      ensure(notice, 404, "NOT_FOUND", "La notificación no existe.");
      notice.read = true;
      return store.save("notification", notice);
    }),
  );
  router.post("/notifications/read-all", (req, res) =>
    mutation(store, req, res, () => {
      const items = own(actorFor(req).id).filter((item) => !item.read);
      for (const item of items)
        store.save("notification", { ...item, read: true });
      return { updated: items.length };
    }),
  );
  const preferences = (actorId: string): Preferences => {
    ensure(
      actorId !== "visitor",
      403,
      "ROLE_REQUIRED",
      "Elige un actor privado.",
    );
    const stored = store.get<Preferences>("preferences", actorId);
    return {
      timezone: stored?.timezone ?? "America/Santiago",
      notificationsEnabled: stored?.notificationsEnabled ?? true,
    };
  };
  router.get("/preferences", (req, res) =>
    res.json(preferences(actorFor(req).id)),
  );
  router.patch("/preferences", (req, res) =>
    mutation(store, req, res, () => {
      const actorId = actorFor(req).id;
      const dto = parse(
        z
          .object({
            timezone: z
              .string()
              .max(100)
              .refine((value) => {
                try {
                  new Intl.DateTimeFormat("es", { timeZone: value });
                  return true;
                } catch {
                  return false;
                }
              }, "Zona horaria inválida.")
              .optional(),
            notificationsEnabled: z.boolean().optional(),
          })
          .strict(),
        req.body,
      );
      const value = { ...preferences(actorId), ...dto };
      store.save("preferences", { id: actorId, ...value });
      return value;
    }),
  );
  return router;
}
