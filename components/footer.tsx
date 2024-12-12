import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-20 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ♥️ by{" "}
            <Link
              href="https://x.com/rink3y"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              RedWilly
            </Link>
            . &copy; {currentYear}.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-4">
            <Link
              href="/privacy"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
