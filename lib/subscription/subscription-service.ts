import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createStripeCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer;
}

export async function createSubscription(userId: string, priceId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
      subscription: true,
    },
  });

  if (!user) throw new Error("User not found");

  let customerId = user.stripeCustomerId;

  if (!customerId && user.email) {
    const customer = await createStripeCustomer(userId, user.email);
    customerId = customer.id;
  }

  if (!customerId) throw new Error("Could not create customer");

  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan: "PRO",
      status: "ACTIVE",
      stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
    update: {
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      plan: "PRO",
      status: "ACTIVE",
      stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    },
  });

  return stripeSubscription;
}