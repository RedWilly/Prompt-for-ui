"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function VerifiedPage() {
  useEffect(() => {
    // Show success toast when page loads
    toast.success("Email verified successfully!", {
      description: "You can now access all features.",
    });
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[600px] max-w-lg mx-auto">
      <div className="flex flex-col items-center space-y-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">
            Email Verified Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for verifying your email address. Your account is now fully activated.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
