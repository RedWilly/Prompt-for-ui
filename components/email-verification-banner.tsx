"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const resendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      toast.success("Verification email sent!", {
        description: "Please check your inbox for the verification link.",
      });
    } catch (error) {
      toast.error("Failed to resend verification email", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert className={cn("border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-0 py-2 text-sm")}>
      <AlertCircle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-sm">
          Please verify your email address.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={resendVerificationEmail}
          disabled={isLoading}
          className="h-7 px-2 text-xs border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-700"
        >
          {isLoading ? "Sending..." : "Verify Email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
