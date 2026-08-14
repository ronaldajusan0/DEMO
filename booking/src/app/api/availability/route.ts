import {
  setAvailability,
  getAvailability,
  AvailabilityError,
} from "@/lib/availability/service";
import { prismaAvailabilityRepo } from "@/lib/availability/repo";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { json, error } from "@/lib/http";

export async function GET(): Promise<Response> {
  try {
    const session = await requireRole("PROVIDER");
    const windows = await getAvailability(prismaAvailabilityRepo, session.uid);
    return json({ availability: windows });
  } catch (e) {
    if (e instanceof AuthzError) return error(e.status, e.message);
    return error(500, "Failed to load availability");
  }
}

export async function PUT(req: Request): Promise<Response> {
  let session;
  try {
    session = await requireRole("PROVIDER");
  } catch (e) {
    if (e instanceof AuthzError) return error(e.status, e.message);
    return error(500, "Auth check failed");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, "Invalid JSON body");
  }

  try {
    const windows = await setAvailability(
      prismaAvailabilityRepo,
      session.uid, // ownership from session, never the client
      body,
    );
    return json({ availability: windows });
  } catch (e) {
    if (e instanceof AvailabilityError) return error(400, e.message);
    return error(500, "Failed to save availability");
  }
}
