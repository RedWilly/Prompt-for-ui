import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { PricingSection } from "@/components/pricing-section";
import { Icons } from "@/components/icons";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Transform Designs into Reality with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upload any website design or UI screenshot and get an instant, accurate prompt to recreate it perfectly.
          </p>
          <div className="space-y-4">
            <Button size="lg" asChild className="px-8">
              <a href="/api/auth/signin">Get Started</a>
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icons.wand className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI algorithms analyze your designs and generate accurate prompts instantly.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icons.code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pixel-Perfect Code</h3>
              <p className="text-muted-foreground">
                Get detailed instructions to recreate your designs with precision using modern frameworks.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icons.zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Save hours of development time with instant prompt generation and clear instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Designs?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who are already using our platform to accelerate their development workflow.
          </p>
          <Button size="lg" asChild className="px-8">
            <a href="/api/auth/signin">Start Building Now</a>
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
    </main>
  );
}