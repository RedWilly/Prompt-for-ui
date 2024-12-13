"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useState } from "react";
import { toast } from "sonner";

export function LinkGoogleButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleGoogleLink = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        redirect: false,
        callbackUrl: "/profile"
      });

      if (result?.error) {
        if (result.error === "EmailMismatch") {
          toast.error("The Google account email must match your current account email.");
        } else {
          toast.error("Failed to link Google account. Please try again.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while linking your Google account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleGoogleLink}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      Link Google Account
    </Button>
  );
}
