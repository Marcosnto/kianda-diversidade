import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

// Bump this when adding a Prisma model. It prevents Next.js development HMR
// from retaining a global client generated from an older schema.
const PRISMA_SCHEMA_VERSION = "2026-09-29-therapeutic-contract";

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

export const prisma =
  (globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION
    ? globalForPrisma.prisma
    : undefined) ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl() }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}
