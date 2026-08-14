// Prisma-backed AvailabilityRepo. replaceForProvider is transactional so a
// provider's window set is swapped atomically (no half-updated state).
import { prisma } from "@/lib/db";
import type { AvailabilityRepo } from "./service";

export const prismaAvailabilityRepo: AvailabilityRepo = {
  listForProvider: (providerId) =>
    prisma.availability.findMany({
      where: { providerId },
      orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
    }),

  replaceForProvider: (providerId, windows) =>
    prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({ where: { providerId } });
      if (windows.length > 0) {
        await tx.availability.createMany({
          data: windows.map((w) => ({ ...w, providerId })),
        });
      }
      return tx.availability.findMany({
        where: { providerId },
        orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
      });
    }),
};
