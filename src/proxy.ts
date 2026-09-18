import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authMiddleware = withAuth(
  function middleware(request) {
    const allCookies = request.cookies.getAll();
    
    // Detect if there are split session cookies (indicates legacy base64 bloat)
    const hasSplitCookie = allCookies.some(cookie => 
      cookie.name.includes("session-token.1") || 
      cookie.name.includes("session-token.2")
    );

    if (hasSplitCookie) {
      console.warn("Legacy bloated session cookie detected. Purging and redirecting to login.");
      const response = NextResponse.redirect(new URL("/login", request.url));
      
      // Delete all session token cookies from the browser
      allCookies.forEach(cookie => {
        if (cookie.name.includes("session-token")) {
          response.cookies.delete(cookie.name);
        }
      });
      
      return response;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        // Require auth only for profile and watchlist routes (matching previous proxy config)
        if (path.startsWith("/profile") || path.startsWith("/watchlist")) {
          return !!token;
        }
        // All other pages are public
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function proxy(request: NextRequest, event: any) {
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  // Targeted early interception for meta-externalagent (including meta-externalagent/1.1)
  // Does NOT block facebookexternalhit, Googlebot, Bingbot, or normal users
  if (userAgent.includes("meta-externalagent")) {
    return new NextResponse("Access forbidden for this crawler.", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
      },
    });
  }

  return (authMiddleware as any)(request, event);
}

export const config = {
  matcher: [
    // Run on all routes except next assets, favicon, and avatar api
    "/((?!_next/static|_next/image|favicon.ico|api/user/avatar).*)",
  ],
};
