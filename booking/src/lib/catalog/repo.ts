// Prisma-backed ServiceRepo. list() returns only active services.
import { prisma } from "@/lib/db";
import type { ServiceRepo } from "./service";

export const prismaServiceRepo: ServiceRepo = {
  list: ({ category }) =>
    prisma.service.findMany({
      where: { active: true, ...(category ? { category } : {}) },
      orderBy: { createdAt: "desc" },
    }),
  findById: (id) => prisma.service.findUnique({ where: { id } }),
  create: (data) => prisma.service.create({ data }),
};
