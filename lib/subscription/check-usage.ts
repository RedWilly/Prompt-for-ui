import { prisma } from "@/lib/prisma";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export const USAGE_LIMITS = {
  FREE: 5,
  PRO: 60,
} as const;

interface UsageError {
  message: string;
  limit: number;
  count: number;
  remainingUses: number;
  canUpgrade: boolean;
}

export async function checkUserUsage(userId: string): Promise<{ count: number; limit: number; remainingUses: number }> {
  const [usage, subscriptionPlan] = await Promise.all([
    prisma.usageCount.findUnique({
      where: { userId },
    }),
    getUserSubscriptionPlan(userId),
  ]);

  if (!usage) {
    throw new Error("Usage record not found");
  }

  const limit = USAGE_LIMITS[subscriptionPlan.plan];
  const remainingUses = limit - usage.count;
  
  if (usage.count >= limit) {
    const error: UsageError = {
      message: subscriptionPlan.plan === "FREE"
        ? `You have reached your free plan limit. Your usage will reset on ${new Date(subscriptionPlan.stripeCurrentPeriodEnd!).toLocaleDateString()}. Upgrade to PRO for more prompts now.`
        : `You have reached your PRO plan limit. Your usage will reset on ${new Date(subscriptionPlan.stripeCurrentPeriodEnd!).toLocaleDateString()}.`,
      limit,
      count: usage.count,
      remainingUses,
      canUpgrade: subscriptionPlan.plan === "FREE"
    };
    throw error;
  }

  return {
    count: usage.count,
    limit,
    remainingUses,
  };
}

export async function incrementUsage(userId: string) {
  const [usage, subscriptionPlan] = await Promise.all([
    prisma.usageCount.findUnique({
      where: { userId },
    }),
    getUserSubscriptionPlan(userId),
  ]);

  if (!usage) {
    throw new Error("Usage record not found");
  }

  const limit = USAGE_LIMITS[subscriptionPlan.plan];
  if (usage.count >= limit) {
    throw new Error("Usage limit reached");
  }

  return prisma.usageCount.update({
    where: { userId },
    data: { count: { increment: 1 } },
  });
}

export async function resetUsage(userId: string) {
  const subscriptionPlan = await getUserSubscriptionPlan(userId);
  
  if (!subscriptionPlan.stripeCurrentPeriodEnd) {
    return;
  }

  const now = new Date();
  const periodEnd = new Date(subscriptionPlan.stripeCurrentPeriodEnd);

  // Only reset if we're past the subscription period end
  if (now >= periodEnd) {
    // Reset the usage count
    await prisma.usageCount.update({
      where: { userId },
      data: { count: 0 },
    });

    // For free users, set a new 30-day period
    if (subscriptionPlan.plan === "FREE") {
      await prisma.subscription.update({
        where: { userId },
        data: {
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      });
    }
  }
}