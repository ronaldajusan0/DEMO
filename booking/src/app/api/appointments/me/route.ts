import { listMyAppointments } from "@/lib/appointments/service";
import { prismaMyAppointmentsRepo } from "@/lib/appointments/repo";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { json, error } from "@/lib/http";

export async function GET(): Promise<Response> {
  try {
    const session = await requireRole("CUSTOMER");
    const appointments = await listMyAppointments(
      prismaMyAppointmentsRepo,
      session.uid, // scoped to the caller — never returns others' bookings
    );
    return json({ appointments });
  } catch (e) {
    if (e instanceof AuthzError) return error(e.status, e.message);
    return error(500, "Failed to load appointments");
  }
}
