import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function createStripeCustomer(userId: string, email: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer;
}

export async function createSubscription(userId: string, priceId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) throw new Error("User not found");

  let { subscription } = user;
  let customerId = subscription?.stripeCustomerId;

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

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: stripeSubscription.id,
      plan: "PREMIUM",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
    },
  });

  return stripeSubscription;
}