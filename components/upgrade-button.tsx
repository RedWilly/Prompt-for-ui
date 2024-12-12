"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  userId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function UpgradeButton({
  userId,
  variant = "default",
  size = "default",
}: UpgradeButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      router.push(data.url);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? "Loading..." : "Upgrade"}
    </Button>
  );
}
