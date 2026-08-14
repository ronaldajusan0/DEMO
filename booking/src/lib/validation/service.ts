// Zod schemas for the service catalog boundary.
import { z } from "zod";

export const createServiceSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).default(""),
    category: z.string().trim().min(1).max(60),
    durationMin: z.number().int().min(5).max(600),
  })
  .strict();

// Query filter for GET /api/services.
export const serviceQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(60).optional(),
  })
  .strict();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
