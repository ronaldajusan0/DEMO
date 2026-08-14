// Auth service: pure orchestration over an injectable user repository so it is
// unit-testable without a database. Route handlers pass a Prisma-backed repo.
import { hashPassword, verifyPassword } from "./password";
import { signupSchema, loginSchema } from "@/lib/validation/auth";

export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
}

// Safe view returned to callers — never carries the password hash.
export type PublicUser = Omit<UserRecord, "passwordHash">;

export interface UserRepo {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
  }): Promise<UserRecord>;
}

export class AuthError extends Error {
  constructor(
    public code: "VALIDATION" | "DUPLICATE_EMAIL" | "INVALID_CREDENTIALS",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const toPublic = (u: UserRecord): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
});

export async function signup(repo: UserRepo, raw: unknown): Promise<PublicUser> {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) throw new AuthError("VALIDATION", "Invalid signup input");

  const existing = await repo.findByEmail(parsed.data.email);
  if (existing) throw new AuthError("DUPLICATE_EMAIL", "Email already registered");

  const user = await repo.create({
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    name: parsed.data.name,
    role: parsed.data.role,
  });
  return toPublic(user);
}

export async function login(repo: UserRepo, raw: unknown): Promise<PublicUser> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) throw new AuthError("VALIDATION", "Invalid login input");

  const user = await repo.findByEmail(parsed.data.email);
  // Same error whether the email is unknown or the password is wrong, so we
  // don't reveal which emails exist.
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password");
  }
  return toPublic(user);
}
