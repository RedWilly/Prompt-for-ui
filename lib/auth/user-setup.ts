import { prisma } from "@/lib/prisma";

export async function createInitialUserData(userId: string) {
  // Create or update usage count
  await prisma.usageCount.upsert({
    where: { userId },
    create: {
      userId,
      count: 0,
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
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    update: {},
  });
}