// Cookie + current-user helpers bound to Next.js request context. Kept apart
// from session.ts so the pure token logic stays DB/framework-free for tests.
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  type SessionPayload,
} from "./session";
import type { Role } from "./service";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

// Regenerate the session (fresh token) and set the cookie. Called on login/signup.
export async function setSession(user: { id: string; role: Role }): Promise<void> {
  const token = createSessionToken({ uid: user.id, role: user.role }, secret());
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function clearSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, secret());
}
