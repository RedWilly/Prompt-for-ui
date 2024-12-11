import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionChange(session);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCancellation(session);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionChange(session: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: session.id },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: session.status === "active" ? "ACTIVE" : "CANCELLED",
      endDate: new Date(session.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionCancellation(session: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: session.id },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "CANCELLED",
      plan: "FREE",
    },
  });
}