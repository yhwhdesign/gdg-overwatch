// db.ts
//
// A single, shared Prisma Client instance that the rest of the backend
// imports from here, instead of each file creating its own `new
// PrismaClient()`.
//
// WHY THIS MATTERS MORE THAN IT LOOKS LIKE IT SHOULD, ESPECIALLY GIVEN
// OUR SERVERLESS ARCHITECTURE:
// Every PrismaClient instance opens its own pool of database
// connections. In a normal long-running server, creating one instance
// at startup is fine — it's created once and reused for the app's
// entire lifetime. But Vercel's serverless functions can be invoked
// many times, and on a "warm" invocation (the same function instance
// handling a second request shortly after the first) any module-level
// code just runs again — including a naive `new PrismaClient()` — which
// would create a NEW set of connections on top of ones already open
// from the previous invocation. Do this enough times and you exhaust
// Neon's connection limit, causing real, hard-to-diagnose production
// errors under normal traffic.
//
// The fix (a standard, well-known Prisma+serverless pattern): stash the
// client on Node's `global` object and reuse it if it already exists,
// so a warm invocation reconnects to the SAME client instance instead
// of creating a new one.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

// Only cache on `global` outside production. In production on Vercel,
// each serverless function invocation that reuses a warm instance will
// still see the same module-level `prisma` constant directly (Node
// doesn't re-run already-loaded modules within the same warm instance),
// so this global-caching trick is really only necessary to prevent
// creating duplicate clients during local development, where tools like
// tsx's watch mode can reload modules more often.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}