// Availability domain logic. Windows are always scoped to the acting provider;
// the client never supplies a providerId. Injectable repo keeps it DB-free.
import { availabilityPutSchema } from "@/lib/validation/availability";

export interface AvailabilityWindowRecord {
  id: string;
  providerId: string;
  weekday: number;
  startMin: number;
  endMin: number;
}

export interface AvailabilityRepo {
  listForProvider(providerId: string): Promise<AvailabilityWindowRecord[]>;
  // Replace the provider's entire window set atomically.
  replaceForProvider(
    providerId: string,
    windows: { weekday: number; startMin: number; endMin: number }[],
  ): Promise<AvailabilityWindowRecord[]>;
}

export class AvailabilityError extends Error {
  constructor(public code: "VALIDATION", message: string) {
    super(message);
    this.name = "AvailabilityError";
  }
}

export async function setAvailability(
  repo: AvailabilityRepo,
  providerId: string,
  raw: unknown,
): Promise<AvailabilityWindowRecord[]> {
  const parsed = availabilityPutSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AvailabilityError("VALIDATION", "Invalid availability windows");
  }
  // Ownership guaranteed: providerId comes from the session, not the payload.
  return repo.replaceForProvider(providerId, parsed.data);
}

export function getAvailability(repo: AvailabilityRepo, providerId: string) {
  return repo.listForProvider(providerId);
}
