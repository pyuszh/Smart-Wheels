import { PrismaClient } from '@prisma/client';

// 1. Look for an existing connection (globalThis.prisma)
// 2. If NOT found (||), make a new one.
export const db = globalThis.prisma || new PrismaClient();

// 3. If we are coding (not production), save the connection to the global shelf
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}