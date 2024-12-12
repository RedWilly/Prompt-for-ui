import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow verification routes to pass through
    if (req.nextUrl.pathname.startsWith("/auth/verify")) {
      return NextResponse.next();
    }

    // If the user is authenticated and trying to access auth pages, redirect to dashboard
    if (req.nextUrl.pathname.startsWith("/auth/") && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow verification routes without auth
        if (req.nextUrl.pathname.startsWith("/auth/verify")) {
          return true;
        }
        // Require auth for dashboard
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
