// Zod schema for weekly availability windows.
import { z } from "zod";

const MIN_OF_DAY = 24 * 60;

export const availabilityWindowSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startMin: z.number().int().min(0).max(MIN_OF_DAY),
    endMin: z.number().int().min(0).max(MIN_OF_DAY),
  })
  .strict()
  .refine((w) => w.startMin < w.endMin, {
    message: "startMin must be < endMin",
  });

// PUT body: the full replacement set of windows for the provider.
export const availabilityPutSchema = z.array(availabilityWindowSchema).max(200);

export type AvailabilityWindow = z.infer<typeof availabilityWindowSchema>;
