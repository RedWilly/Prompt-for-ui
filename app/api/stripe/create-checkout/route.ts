import { getURL } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(userId);

    // If user is already subscribed to PRO plan, return error
    if (subscriptionPlan.plan === "PRO") {
      return new NextResponse("Already subscribed to PRO plan", { status: 400 });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${getURL()}/dashboard?success=true`,
      cancel_url: `${getURL()}/dashboard?canceled=true`,
      customer_email: subscriptionPlan.stripeCustomerId || undefined,
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
