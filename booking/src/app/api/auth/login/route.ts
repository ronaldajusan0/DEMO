import { login, AuthError } from "@/lib/auth/service";
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
    const user = await login(prismaUserRepo, body);
    // Regenerate the session on every login (fresh token).
    await setSession(user);
    return json({ user }, 200);
  } catch (e) {
    if (e instanceof AuthError) return error(401, "Invalid email or password");
    return error(500, "Login failed");
  }
}
