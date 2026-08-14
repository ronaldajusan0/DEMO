// Prisma-backed read model for a customer's appointments.
import { prisma } from "@/lib/db";
import type { MyAppointmentsRepo, MyAppointment } from "./service";

export const prismaMyAppointmentsRepo: MyAppointmentsRepo = {
  async listForCustomer(customerId): Promise<MyAppointment[]> {
    const rows = await prisma.appointment.findMany({
      where: { customerId },
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        service: { select: { name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      serviceName: r.service.name,
      startAt: r.startAt,
      endAt: r.endAt,
      status: r.status,
    }));
  },
};
