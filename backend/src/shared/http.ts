import type { Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "./errors.js";
import { Store } from "./database/store.js";
import { actorFor } from "../modules/context/context.js";
export function parse<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success)
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "Revisa los datos indicados.",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        reason: issue.message,
      })),
    );
  return result.data;
}
export function mutation(
  store: Store,
  req: Request,
  res: Response,
  work: () => unknown,
  status = 200,
) {
  const result = store.mutate(
    actorFor(req).id,
    `${req.method} ${req.path}`,
    req.header("Idempotency-Key"),
    req.body ?? {},
    () => ({ status, value: work() }),
  );
  if (result.status === 204) res.status(204).end();
  else res.status(result.status).json(result.value);
}
export const param = (req: Request, name: string) => String(req.params[name]);
