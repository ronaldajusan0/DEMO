// Session token = base64url(payload).HMAC-SHA256(payload, SESSION_SECRET).
// Stateless, signed, tamper-evident. Pure functions here are unit-testable;
// cookie wiring lives in ./cookies.ts (Next request/response bound).
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Role } from "./service";

export interface SessionPayload {
  uid: string;
  role: Role;
  iat: number; // issued-at (ms)
  nonce: string; // makes each login's token unique (session regeneration)
}

const b64url = (b: Buffer) => b.toString("base64url");

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(
  input: { uid: string; role: Role },
  secret: string,
): string {
  const payload: SessionPayload = {
    uid: input.uid,
    role: input.role,
    iat: Date.now(),
    nonce: randomBytes(9).toString("base64url"),
  };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(body, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "bookit_session";

// Hardened cookie flags (AGENT.md §2): httpOnly + Secure + SameSite=Lax.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
