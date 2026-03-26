import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - terms, privacy (support pages)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg|login|terms|privacy|ads.txt|robots.txt|sitemap.xml|sw.js|google[a-zA-Z0-9]+.html).*)",
  ],
};
