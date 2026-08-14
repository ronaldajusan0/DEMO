// Cancellation domain logic. Owner-only, blocked within 24h of start. Freeing
// the slot is implicit: slot generation and the overlap guard only consider
// CONFIRMED appointments, so flipping status to CANCELLED reopens the time.
import type { AppointmentRecord } from "./service";
import type { Role } from "@/lib/auth/service";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CancelRepo {
  getById(id: string): Promise<AppointmentRecord | null>;
  cancel(id: string): Promise<AppointmentRecord>;
}

export class CancelError extends Error {
  constructor(
    public code: "NOT_FOUND" | "FORBIDDEN" | "TOO_LATE" | "ALREADY_CANCELLED",
    message: string,
  ) {
    super(message);
    this.name = "CancelError";
  }
}

export async function cancelAppointment(
  repo: CancelRepo,
  actor: { id: string; role: Role },
  appointmentId: string,
  now: Date = new Date(),
): Promise<AppointmentRecord> {
  const appt = await repo.getById(appointmentId);
  if (!appt) throw new CancelError("NOT_FOUND", "Appointment not found");

  // Ownership: only the booking customer may cancel it.
  if (appt.customerId !== actor.id) {
    throw new CancelError("FORBIDDEN", "Not your appointment");
  }
  if (appt.status === "CANCELLED") {
    throw new CancelError("ALREADY_CANCELLED", "Already cancelled");
  }

  // Blocked within 24h of start (exactly 24h out is still allowed).
  if (appt.startAt.getTime() - now.getTime() < DAY_MS) {
    throw new CancelError("TOO_LATE", "Cannot cancel within 24 hours of start");
  }

  return repo.cancel(appointmentId);
}
