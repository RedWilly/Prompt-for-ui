"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication.";
  let actionMessage = "Please try again or contact support if the issue persists.";

  if (error === "OAuth_Account_Not_Linked") {
    errorMessage = "Your Google account is not linked to an existing account.";
    actionMessage = "Please sign in with your email and password first, then link your Google account from your profile.";
  } else if (error === "EmailMismatch") {
    errorMessage = "The Google account email does not match your current account.";
    actionMessage = "Please use a Google account with the same email as your existing account.";
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Authentication Error</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">{actionMessage}</p>
        </div>
        <div className="grid gap-4">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
