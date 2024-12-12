import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SubscriptionButton } from "@/components/subscription-button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
  const usageCount = await prisma.usageCount.findUnique({
    where: { userId: session.user.id },
  });

  const maxUsage = subscriptionPlan.plan === "PRO" ? 60 : 5;
  const usagePercentage = (usageCount?.count || 0) / maxUsage * 100;

  return (
    <div className="container max-w-6xl py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dashboard" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and subscription
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">{session.user.name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Subscription
                <Badge variant={subscriptionPlan.plan === "PRO" ? "default" : "secondary"}>
                  {subscriptionPlan.plan === "PRO" ? "Pro Plan" : "Free Plan"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscriptionPlan.plan === "PRO"
                  ? "You are currently on the Pro plan"
                  : "You are currently on the Free plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Usage</label>
                <div className="space-y-1">
                  <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {usageCount?.count || 0} / {maxUsage} prompts generated
                  </p>
                </div>
              </div>
              {subscriptionPlan.plan === "PRO" && subscriptionPlan.stripeCurrentPeriodEnd && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">Next billing date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscriptionPlan.stripeCurrentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <SubscriptionButton
                userId={session.user.id}
                isPro={subscriptionPlan.plan === "PRO"}
                stripeCustomerId={subscriptionPlan.stripeCustomerId}
                stripeSubscriptionId={subscriptionPlan.stripeSubscriptionId}
                isCurrentPlan={true}
              />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
