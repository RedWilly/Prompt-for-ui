import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import SessionProvider from "@/components/session-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PixelUI - Turn Designs into Code",
  description: "Upload any website design or UI mockup and instantly get AI-optimized prompts for development. Convert your visual designs into precise, detailed prompts for AI-powered web development. Save time and improve accuracy in your development workflow.",
  keywords: "AI prompts, web development, UI design, design to code, AI development, website generator, UI conversion, design transformation",
  openGraph: {
    title: "PixelUI - Turn Designs into Code",
    description: "Upload any website design or UI mockup and instantly get AI-optimized prompts for development. Transform your visual designs into precise prompts for AI-powered web development.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
