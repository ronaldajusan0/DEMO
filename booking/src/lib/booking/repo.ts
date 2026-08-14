// Prisma-backed BookingRepo. createIfFree runs a Serializable transaction so
// two concurrent requests cannot both pass the overlap check — the loser's
// transaction fails to commit and we treat it as a conflict (409).
import { prisma } from "@/lib/db";
import type { BookingRepo, AppointmentRecord } from "./service";

export const prismaBookingRepo: BookingRepo = {
  getService: (id) =>
    prisma.service.findUnique({
      where: { id },
      select: { id: true, providerId: true, durationMin: true, active: true },
    }),

  listAvailability: (providerId) =>
    prisma.availability.findMany({
      where: { providerId },
      select: { weekday: true, startMin: true, endMin: true },
    }),

  async createIfFree(data): Promise<AppointmentRecord | null> {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const clash = await tx.appointment.count({
            where: {
              providerId: data.providerId,
              status: "CONFIRMED",
              startAt: { lt: data.endAt },
              endAt: { gt: data.startAt },
            },
          });
          if (clash > 0) return null;
          return tx.appointment.create({ data: { ...data, status: "CONFIRMED" } });
        },
        { isolationLevel: "Serializable" },
      );
    } catch {
      // Serialization failure under concurrency → the slot was contended.
      return null;
    }
  },
};
