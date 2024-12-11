import { prisma } from "@/lib/prisma";

export async function checkUserUsage(userId: string) {
  const usage = await prisma.usageCount.findUnique({
    where: { userId },
    include: { user: { include: { subscription: true } } },
  });

  if (!usage) {
    throw new Error("Usage record not found");
  }

  const limit = usage.user.subscription?.plan === "PREMIUM" ? 60 : 5;
  if (usage.count >= limit) {
    throw new Error("Usage limit exceeded");
  }

  return usage;
}

export async function incrementUsage(userId: string) {
  await prisma.usageCount.update({
    where: { userId },
    data: { count: { increment: 1 } },
  });
}