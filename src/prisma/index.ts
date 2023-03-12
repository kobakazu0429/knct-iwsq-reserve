import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({ log: ["query", "error", "info", "warn"] });
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export { prisma };