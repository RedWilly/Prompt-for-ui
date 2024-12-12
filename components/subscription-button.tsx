"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { createStripePortal } from "@/lib/stripe/actions";

interface SubscriptionButtonProps {
  userId: string;
  isPro: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  isCurrentPlan?: boolean;
}

export function SubscriptionButton({
  userId,
  isPro,
  stripeCustomerId,
  stripeSubscriptionId,
  isCurrentPlan,
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubscription = async () => {
    try {
      setIsLoading(true);

      if (isPro && stripeSubscriptionId) {
        // Open customer portal to manage subscription
        const { url } = await createStripePortal({
          stripeCustomerId: stripeCustomerId!,
          returnUrl: window.location.href,
        });
        window.location.href = url;
      } else {
        // Redirect to pricing page for upgrade
        window.location.href = "/pricing";
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isPro ? "outline" : "default"}
      className="w-full"
      onClick={handleSubscription}
      disabled={isLoading}
    >
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {isPro ? "Manage Subscription" : "Upgrade to Pro"}
    </Button>
  );
}
