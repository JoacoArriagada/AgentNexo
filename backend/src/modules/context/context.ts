import type { Request } from "express";
import type { Actor, Role } from "@agentnexo/api-contracts";
import { ACTORS } from "../../shared/database/store.js";
import { ensure } from "../../shared/errors.js";
export function actorFor(req: Request): Actor {
  const value = req.header("X-Actor-Id") ?? "visitor";
  const actor = ACTORS.find((item) => item.id === value);
  ensure(actor, 422, "UNKNOWN_ACTOR", "El actor de demostración no existe.");
  return actor;
}
export function requireRole(actor: Actor, role: Role) {
  ensure(
    actor.roles.includes(role),
    403,
    "ROLE_REQUIRED",
    "Este actor no puede realizar la acción.",
  );
}
