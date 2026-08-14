// Prisma-backed implementation of UserRepo. Route handlers use this; tests use
// an in-memory fake instead.
import { prisma } from "@/lib/db";
import type { UserRepo } from "./service";

export const prismaUserRepo: UserRepo = {
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  create: (data) => prisma.user.create({ data }),
};
