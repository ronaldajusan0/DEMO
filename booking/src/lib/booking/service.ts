// Booking domain logic. The double-booking guard lives in the repo's atomic
// createIfFree (a DB transaction with an overlap check); this service validates
// the actor, the service, and slot legitimacy before attempting the insert.
import { createAppointmentSchema } from "@/lib/validation/appointment";
import { isValidSlotStart } from "@/lib/slots/generate";
import type { Role } from "@/lib/auth/service";

export interface BookingServiceRecord {
  id: string;
  providerId: string;
  durationMin: number;
  active: boolean;
}

export interface AppointmentRecord {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  startAt: Date;
  endAt: Date;
  status: "CONFIRMED" | "CANCELLED";
}

export interface BookingRepo {
  getService(id: string): Promise<BookingServiceRecord | null>;
  listAvailability(
    providerId: string,
  ): Promise<{ weekday: number; startMin: number; endMin: number }[]>;
  // Atomically create the appointment iff no CONFIRMED overlap exists for the
  // provider. Returns null when the slot was already taken (→ 409).
  createIfFree(data: {
    serviceId: string;
    customerId: string;
    providerId: string;
    startAt: Date;
    endAt: Date;
  }): Promise<AppointmentRecord | null>;
}

export class BookingError extends Error {
  constructor(
    public code:
      | "VALIDATION"
      | "FORBIDDEN"
      | "SERVICE_NOT_FOUND"
      | "INVALID_SLOT"
      | "CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export async function bookAppointment(
  repo: BookingRepo,
  actor: { id: string; role: Role },
  raw: unknown,
): Promise<AppointmentRecord> {
  if (actor.role !== "CUSTOMER") {
    throw new BookingError("FORBIDDEN", "Only customers can book");
  }

  const parsed = createAppointmentSchema.safeParse(raw);
  if (!parsed.success) throw new BookingError("VALIDATION", "Invalid booking input");

  const service = await repo.getService(parsed.data.serviceId);
  if (!service || !service.active) {
    throw new BookingError("SERVICE_NOT_FOUND", "Service not found");
  }

  const start = new Date(parsed.data.start);
  const availability = await repo.listAvailability(service.providerId);
  // Reject arbitrary times: the start must be a legitimate generated slot.
  if (!isValidSlotStart({ durationMin: service.durationMin }, availability, start)) {
    throw new BookingError("INVALID_SLOT", "Requested time is not a bookable slot");
  }

  const end = new Date(start.getTime() + service.durationMin * 60_000);
  const created = await repo.createIfFree({
    serviceId: service.id,
    customerId: actor.id,
    providerId: service.providerId,
    startAt: start,
    endAt: end,
  });
  if (!created) throw new BookingError("CONFLICT", "Slot already booked");

  return created;
}
