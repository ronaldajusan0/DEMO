// Service-catalog domain logic over an injectable repo (DB-free, unit-testable).
import { createServiceSchema } from "@/lib/validation/service";
import type { Role } from "@/lib/auth/service";

export interface ServiceRecord {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  durationMin: number;
  active: boolean;
}

export interface ServiceRepo {
  list(filter: { category?: string }): Promise<ServiceRecord[]>;
  findById(id: string): Promise<ServiceRecord | null>;
  create(data: Omit<ServiceRecord, "id">): Promise<ServiceRecord>;
}

export class CatalogError extends Error {
  constructor(public code: "VALIDATION" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "CatalogError";
  }
}

// List only active services; optional category filter (validated at boundary).
export function listServices(repo: ServiceRepo, filter: { category?: string }) {
  return repo.list(filter);
}

export function getService(repo: ServiceRepo, id: string) {
  return repo.findById(id);
}

export async function createService(
  repo: ServiceRepo,
  actor: { id: string; role: Role },
  raw: unknown,
): Promise<ServiceRecord> {
  // Provider-only — enforced server-side, not trusted from the client.
  if (actor.role !== "PROVIDER") {
    throw new CatalogError("FORBIDDEN", "Only providers can create services");
  }
  const parsed = createServiceSchema.safeParse(raw);
  if (!parsed.success) throw new CatalogError("VALIDATION", "Invalid service input");

  return repo.create({
    providerId: actor.id,
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    durationMin: parsed.data.durationMin,
    active: true,
  });
}
