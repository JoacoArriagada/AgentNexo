import { z } from "zod";
import { minor } from "../offers/dto/offer.dto.js";
export const inputFileDto = z
  .object({
    name: z.string().min(1).max(120),
    content: z.string(),
    language: z.enum(["javascript", "typescript"]).optional(),
    id: z.string().optional(),
  })
  .strict();
export const createJobDto = z
  .object({
    title: z.string().trim().min(3).max(100),
    objective: z.string().trim().min(20).max(2000),
    acceptanceCriteria: z
      .array(z.string().trim().min(1).max(500))
      .min(1)
      .max(10),
    files: z.array(inputFileDto).min(1).max(3),
    context: z.enum(["private-review", "public-demo"]).optional(),
  })
  .strict();
export const editJobDto = createJobDto
  .omit({ context: true })
  .partial()
  .extend({ expectedVersion: z.number().int().positive() })
  .strict();
export const policyDto = z
  .object({
    expectedVersion: z.number().int().positive(),
    mode: z.enum(["reviewer", "two-role-demo"]),
    modelLimitMinor: minor,
    toolLimitMinor: minor,
    feeLimitMinor: minor,
    maxOperationMinor: minor,
    allowTools: z.boolean(),
  })
  .strict();
export const authorizationDto = z
  .object({
    policyVersion: z.number().int().positive(),
    policyDigest: z.string().length(64),
    accept: z.literal(true),
  })
  .strict();
