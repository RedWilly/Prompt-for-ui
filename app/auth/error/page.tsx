import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Authentication Error",
  description: "An error occurred during authentication",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  let errorMessage = "An error occurred during authentication.";
  let actionMessage = "Please try again or contact support if the issue persists.";

  if (searchParams?.error === "OAuth_Account_Not_Linked") {
    errorMessage = "Your Google account is not linked to your existing account.";
    actionMessage = "Please sign in with your email and password first, then link your Google account from your profile.";
  } else if (searchParams?.error === "EmailMismatch") {
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
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
