// Password hashing via Node's built-in scrypt (no third-party dep needed).
// Format: scrypt$<N>$<saltHex>$<hashHex>. Never store or log plaintext.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const COST = 16384; // scrypt N
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, KEYLEN, { N: COST });
  return `scrypt$${COST}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const cost = Number(parts[1]);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  const actual = scryptSync(plain, salt, expected.length, { N: cost });
  // Constant-time compare to avoid leaking match progress via timing.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
