import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error instanceof Error ? error.message : error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // First update or create user's stripe customer ID
        await prisma.user.update({
          where: {
            id: session.metadata?.userId,
          },
          data: {
            stripeCustomerId: subscription.customer as string,
          },
        });

        // Then update or create subscription
        await prisma.subscription.upsert({
          where: {
            userId: session.metadata?.userId,
          },
          create: {
            userId: session.metadata?.userId!,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: "PRO",
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: "PRO",
          },
        });

        // Reset usage count when upgrading to PRO
        await prisma.usageCount.update({
          where: {
            userId: session.metadata?.userId,
          },
          data: {
            count: 0,
            updatedAt: new Date(),
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        // Retrieve the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Update the subscription
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        await prisma.subscription.update({
          where: {
            stripeSubscriptionId: session.subscription as string,
          },
          data: {
            status: "CANCELED",
            plan: "FREE",
          },
        });
        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error instanceof Error ? error.message : error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
