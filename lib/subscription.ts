import { prisma } from "@/lib/prisma";

export type SubscriptionPlan = {
  id?: string;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
  plan: "FREE" | "PRO";
  status?: "ACTIVE" | "CANCELED" | "EXPIRED" | "PAST_DUE";
  stripeCustomerId?: string | null;
  isSubscriptionActive: boolean;
};

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeCustomerId: true,
      subscription: {
        select: {
          id: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          plan: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const subscription = user.subscription;

  // Check if user has an active subscription
  const isSubscriptionActive =
    subscription?.stripeCurrentPeriodEnd != null &&
    subscription.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now() &&
    subscription.status === "ACTIVE";

  const plan = isSubscriptionActive && subscription ? subscription.plan : "FREE";

  return {
    ...subscription,
    stripeCustomerId: user.stripeCustomerId,
    plan,
    isSubscriptionActive,
  } as SubscriptionPlan;
}
