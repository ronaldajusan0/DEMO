// Query validation for GET /api/services/:id/slots.
import { z } from "zod";

export const slotsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .strict();

const DAY = 24 * 60 * 60 * 1000;
const MAX_RANGE = 60 * DAY;

// Resolve a bounded [from, to] range, defaulting to the next 14 days.
export function resolveRange(q: { from?: string; to?: string }): {
  from: Date;
  to: Date;
} {
  const from = q.from ? new Date(q.from) : new Date();
  const to = q.to ? new Date(q.to) : new Date(from.getTime() + 14 * DAY);
  const cappedTo = new Date(Math.min(to.getTime(), from.getTime() + MAX_RANGE));
  return { from, to: cappedTo };
}
