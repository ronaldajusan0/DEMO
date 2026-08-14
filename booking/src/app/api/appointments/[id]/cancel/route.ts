import { cancelAppointment, CancelError } from "@/lib/booking/cancel";
import { prismaCancelRepo } from "@/lib/booking/repo";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { json, error } from "@/lib/http";

const STATUS: Record<CancelError["code"], number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  TOO_LATE: 403,
  ALREADY_CANCELLED: 409,
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  let session;
  try {
    session = await requireRole("CUSTOMER");
  } catch (e) {
    if (e instanceof AuthzError) return error(e.status, e.message);
    return error(500, "Auth check failed");
  }

  const { id } = await params;
  try {
    const appt = await cancelAppointment(prismaCancelRepo, {
      id: session.uid,
      role: session.role,
    }, id);
    return json({ appointment: appt });
  } catch (e) {
    if (e instanceof CancelError) return error(STATUS[e.code], e.message);
    return error(500, "Cancel failed");
  }
}
