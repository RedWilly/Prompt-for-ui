"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { LogoIcon } from "./ui/icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background/0"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center space-x-2 transition-opacity hover:opacity-90"
        >
          <LogoIcon className="h-8 w-8 transition-transform duration-200 hover:scale-105" />
          <span className="hidden font-bold sm:inline-block">PixelUI</span>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          {session ? (
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="transition-colors hover:bg-secondary"
            >
              <span className="hidden sm:inline-block">Sign Out</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button 
                variant="default"
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <span className="hidden sm:inline-block">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
