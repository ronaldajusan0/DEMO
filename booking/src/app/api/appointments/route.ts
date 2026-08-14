import { bookAppointment, BookingError } from "@/lib/booking/service";
import { prismaBookingRepo } from "@/lib/booking/repo";
import { requireRole, AuthzError } from "@/lib/auth/guard";
import { json, error } from "@/lib/http";
import { prisma } from "@/lib/db";
import { sendBookingConfirmation } from "@/lib/email/confirmation";
import { consoleEmailSender } from "@/lib/email/sender";

const STATUS: Record<BookingError["code"], number> = {
  VALIDATION: 400,
  FORBIDDEN: 403,
  SERVICE_NOT_FOUND: 404,
  INVALID_SLOT: 422,
  CONFLICT: 409,
};

export async function POST(req: Request): Promise<Response> {
  let session;
  try {
    session = await requireRole("CUSTOMER");
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
    const appt = await bookAppointment(
      prismaBookingRepo,
      { id: session.uid, role: session.role },
      body,
    );

    // Confirmation email via the injectable sender (demo sender logs no PII).
    const [customer, service] = await Promise.all([
      prisma.user.findUnique({
        where: { id: appt.customerId },
        select: { email: true, name: true },
      }),
      prisma.service.findUnique({
        where: { id: appt.serviceId },
        select: { name: true },
      }),
    ]);
    if (customer && service) {
      await sendBookingConfirmation(consoleEmailSender, {
        to: customer.email,
        customerName: customer.name,
        serviceName: service.name,
        startAt: appt.startAt,
        endAt: appt.endAt,
      });
    }

    return json({ appointment: appt }, 201);
  } catch (e) {
    if (e instanceof BookingError) return error(STATUS[e.code], e.message);
    return error(500, "Booking failed");
  }
}
