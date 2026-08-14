import { signup, AuthError } from "@/lib/auth/service";
import { prismaUserRepo } from "@/lib/auth/repo";
import { setSession } from "@/lib/auth/cookies";
import { json, error } from "@/lib/http";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, "Invalid JSON body");
  }

  try {
    const user = await signup(prismaUserRepo, body);
    await setSession(user);
    return json({ user }, 201);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.code === "DUPLICATE_EMAIL") return error(409, e.message);
      return error(400, e.message);
    }
    // Never leak internals / PII in the message.
    return error(500, "Signup failed");
  }
}
