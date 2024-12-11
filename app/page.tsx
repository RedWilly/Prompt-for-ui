import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { UploadHero } from "@/components/upload-hero";
import { PricingSection } from "@/components/pricing-section";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen">
      <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-secondary">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Designs into Reality with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upload any website design or UI screenshot and get an instant, accurate prompt to recreate it perfectly.
          </p>
          {session ? (
            <UploadHero />
          ) : (
            <Button size="lg" asChild>
              <a href="/api/auth/signin">Get Started</a>
            </Button>
          )}
        </div>
      </section>
      
      <PricingSection />
    </main>
  );
}