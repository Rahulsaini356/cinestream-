import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/user/avatar).*)",
  ],
};
