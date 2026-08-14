// Zod schema for creating an appointment.
import { z } from "zod";

export const createAppointmentSchema = z
  .object({
    serviceId: z.string().min(1),
    start: z.string().datetime(),
  })
  .strict();

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
