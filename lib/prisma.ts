import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ["query"], // You can also add other logs like 'info', 'warn', or 'error' for debugging
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma; // Ensure global Prisma instance in development
}

