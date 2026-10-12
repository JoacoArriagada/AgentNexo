import { z } from "zod";
export const minor = z
  .string()
  .regex(/^(0|[1-9]\d*)$/)
  .refine(
    (value) => BigInt(value) <= 1000000000000000n,
    "Importe demasiado grande.",
  );
export const offerDto = z
  .object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(20).max(2000),
    profile: z.enum(["reviewer", "two-role-demo"]),
    priceMinor: minor.refine((value) => BigInt(value) > 0n),
  })
  .strict();
export const editOfferDto = offerDto
  .partial()
  .extend({ expectedVersion: z.number().int().positive() })
  .strict();
export const moderationDto = z
  .object({
    expectedVersion: z.number().int().positive(),
    decision: z.enum(["approve", "reject", "suspend"]),
    reason: z.string().trim().min(3).max(1000),
  })
  .strict();
