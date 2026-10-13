import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure SQLite dev.db is writable in Vercel Serverless environment
if (process.env.VERCEL) {
  const tmpDbPath = path.join("/tmp", "dev.db");
  const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
    try {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    } catch (e) {
      console.warn("Could not copy dev.db to /tmp:", e);
    }
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:")) {
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
