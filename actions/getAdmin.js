"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAdmin() {
  const { userId } = await auth();

  // ❌ DO NOT throw
  if (!userId) {
    return { authorized: false };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return { authorized: false };
  }

  return { authorized: true, user };
}
