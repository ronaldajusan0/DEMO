// Server-side authorization guards. Every protected route calls these; the
// client is never trusted for role or identity.
import { getSession } from "./cookies";
import type { Role } from "./service";
import type { SessionPayload } from "./session";

export class AuthzError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthzError";
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new AuthzError(401, "Authentication required");
  return s;
}

export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const s = await requireUser();
  if (!roles.includes(s.role)) throw new AuthzError(403, "Forbidden");
  return s;
}
