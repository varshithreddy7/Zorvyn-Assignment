const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

// Reuse the same Prisma instance across hot-reloads in development
// to avoid exhausting the connection pool.
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
