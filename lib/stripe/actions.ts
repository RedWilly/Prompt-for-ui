"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function createStripePortal({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}) {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Error creating stripe portal:", error);
    throw new Error("Failed to create stripe portal session");
  }
}

export async function createStripeSession({
  userId,
  priceId,
}: {
  userId: string;
  priceId: string;
}) {
  try {
    const billingUrl = absoluteUrl("/billing");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create a new customer if one doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          userId,
        },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${billingUrl}?success=true`,
      cancel_url: `${billingUrl}?success=false`,
      metadata: {
        userId,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating stripe session:", error);
    throw new Error("Failed to create stripe checkout session");
  }
}
