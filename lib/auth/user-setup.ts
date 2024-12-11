import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function createInitialUserData(userId: string) {
  // Create or update usage count
  await prisma.usageCount.upsert({
    where: { userId },
    create: {
      userId,
      count: 0,
      resetDate: new Date(),
    },
    update: {},
  });

  // Create free subscription if user doesn't have one
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: "FREE",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
    },
    update: {},
  });
}