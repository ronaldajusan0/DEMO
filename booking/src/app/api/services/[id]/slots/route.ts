import { prisma } from "@/lib/db";
import { generateSlots } from "@/lib/slots/generate";
import { slotsQuerySchema, resolveRange } from "@/lib/validation/slots";
import { json, error } from "@/lib/http";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const url = new URL(req.url);
  const parsed = slotsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return error(400, "Invalid query");
  const range = resolveRange(parsed.data);

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service || !service.active) return error(404, "Service not found");

  const availability = await prisma.availability.findMany({
    where: { providerId: service.providerId },
  });

  // Only CONFIRMED appointments for this provider block slots.
  const appointments = await prisma.appointment.findMany({
    where: {
      providerId: service.providerId,
      status: "CONFIRMED",
      startAt: { lt: range.to },
      endAt: { gt: range.from },
    },
    select: { startAt: true, endAt: true },
  });

  const slots = generateSlots(
    { durationMin: service.durationMin },
    availability,
    appointments,
    range,
  );

  return json({
    slots: slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    })),
  });
}
