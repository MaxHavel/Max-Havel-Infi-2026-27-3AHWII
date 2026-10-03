import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./generated/prisma/client.ts";

function dbUrl(): string {
  try {
    return Deno.env.get("DATABASE_URL") ?? "file:./prisma/dev.db";
  } catch {
    return "file:./prisma/dev.db";
  }
}

// Hinweis: README-Fallback — better-sqlite3 baut unter Deno (Windows) kein
// natives Binding ("Could not locate the bindings file"), daher libsql
// (reiner WASM/JS-Pfad, kein Build-Step). API bleibt identisch.
const adapter = new PrismaLibSql({ url: dbUrl() });
export const prisma = new PrismaClient({ adapter });
