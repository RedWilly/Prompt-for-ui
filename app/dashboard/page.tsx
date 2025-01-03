import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { UploadHero } from "@/components/upload-hero";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { UpgradeButton } from "@/components/upgrade-button";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS } from "@/lib/subscription/check-usage";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  try {
    const [subscriptionPlan, usage, user] = await Promise.all([
      getUserSubscriptionPlan(session.user.id),
      prisma.usageCount.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, email: true },
      }),
    ]);

    const maxUsage = USAGE_LIMITS[subscriptionPlan.plan];
    const currentUsage = usage?.count || 0;
    const remainingUses = Math.max(0, maxUsage - currentUsage);

    return (
      <main className="container max-w-6xl py-8">
        <div className="flex flex-col gap-4">
          {/* Email Verification Banner */}
          {user && user.email && !user.emailVerified && (
            <EmailVerificationBanner email={user.email} />
          )}

          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Upload your design and get pixel-perfect code
            </p>
          </div>

          {/* Usage Stats */}
          <div className="grid gap-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Usage</h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {subscriptionPlan.plan} Plan
                  </div>
                  {subscriptionPlan.plan === "FREE" && (
                    <UpgradeButton userId={session.user.id} size="sm" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {currentUsage} / {maxUsage}
                </div>
                <p className="text-sm text-muted-foreground">
                  {remainingUses > 0
                    ? `${remainingUses} prompts remaining`
                    : subscriptionPlan.plan === "FREE" 
                      ? "Upgrade to PRO for more prompts"
                      : "Start generating prompts"}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="rounded-lg border bg-card p-8">
            <UploadHero />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <main className="container max-w-6xl py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Something went wrong. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
