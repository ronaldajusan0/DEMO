import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import {
  signup,
  login,
  AuthError,
  type UserRepo,
  type UserRecord,
  type Role,
} from "../src/lib/auth/service";
import {
  createSessionToken,
  verifySessionToken,
} from "../src/lib/auth/session";

// In-memory fake so the auth service is tested without a database.
function fakeRepo(): UserRepo & { rows: UserRecord[] } {
  const rows: UserRecord[] = [];
  return {
    rows,
    async findByEmail(email) {
      return rows.find((r) => r.email === email) ?? null;
    },
    async create(data) {
      const rec: UserRecord = { id: `u${rows.length + 1}`, ...data };
      rows.push(rec);
      return rec;
    },
  };
}

describe("password hashing", () => {
  it("never stores plaintext and verifies correctly", () => {
    const stored = hashPassword("s3cret-password");
    expect(stored).not.toContain("s3cret-password");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("s3cret-password", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("produces a different hash per call (random salt)", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });
});

describe("signup", () => {
  it("creates a user and returns no password hash", async () => {
    const repo = fakeRepo();
    const user = await signup(repo, {
      email: "Amy@Example.com",
      password: "longenough1",
      name: "Amy",
    });
    expect(user).toEqual({
      id: "u1",
      email: "amy@example.com", // normalized
      name: "Amy",
      role: "CUSTOMER",
    });
    expect(user as Record<string, unknown>).not.toHaveProperty("passwordHash");
    expect(repo.rows[0].passwordHash).not.toContain("longenough1");
  });

  it("rejects duplicate email", async () => {
    const repo = fakeRepo();
    const input = { email: "a@b.com", password: "longenough1", name: "A" };
    await signup(repo, input);
    await expect(signup(repo, input)).rejects.toMatchObject({
      code: "DUPLICATE_EMAIL",
    });
  });

  it("rejects invalid input (short password, bad email, unknown key)", async () => {
    const repo = fakeRepo();
    await expect(
      signup(repo, { email: "a@b.com", password: "short", name: "A" }),
    ).rejects.toBeInstanceOf(AuthError);
    await expect(
      signup(repo, { email: "nope", password: "longenough1", name: "A" }),
    ).rejects.toBeInstanceOf(AuthError);
    await expect(
      signup(repo, {
        email: "a@b.com",
        password: "longenough1",
        name: "A",
        isAdmin: true,
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("cannot self-assign ADMIN role", async () => {
    const repo = fakeRepo();
    await expect(
      signup(repo, {
        email: "a@b.com",
        password: "longenough1",
        name: "A",
        role: "ADMIN" as Role,
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

describe("login", () => {
  it("succeeds with correct credentials", async () => {
    const repo = fakeRepo();
    await signup(repo, { email: "a@b.com", password: "longenough1", name: "A" });
    const user = await login(repo, { email: "a@b.com", password: "longenough1" });
    expect(user.email).toBe("a@b.com");
  });

  it("fails with wrong password (generic error)", async () => {
    const repo = fakeRepo();
    await signup(repo, { email: "a@b.com", password: "longenough1", name: "A" });
    await expect(
      login(repo, { email: "a@b.com", password: "nope-nope1" }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("fails for unknown email with the same generic error", async () => {
    const repo = fakeRepo();
    await expect(
      login(repo, { email: "ghost@b.com", password: "whatever1" }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });
});

describe("session token", () => {
  it("round-trips a signed payload", () => {
    const t = createSessionToken({ uid: "u1", role: "PROVIDER" }, "test-secret");
    const p = verifySessionToken(t, "test-secret");
    expect(p?.uid).toBe("u1");
    expect(p?.role).toBe("PROVIDER");
  });

  it("rejects a tampered token or wrong secret", () => {
    const t = createSessionToken({ uid: "u1", role: "CUSTOMER" }, "test-secret");
    expect(verifySessionToken(t, "other-secret")).toBeNull();
    expect(verifySessionToken(t.slice(0, -2) + "xx", "test-secret")).toBeNull();
    expect(verifySessionToken(undefined, "test-secret")).toBeNull();
  });
});
