import { NextRequest, NextResponse } from "next/server";

const STAFF_PATHS = ["/backoffice", "/agent"];
const STAFF_API = ["/api/admin", "/api/agent"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Baseline browser hardening. External map/payment providers remain allowed explicitly.
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Staff pages are also protected server-side by their layouts. These redirects are only
  // a lightweight UX guard for unauthenticated requests; API authorization remains authoritative.
  if ([...STAFF_PATHS, ...STAFF_API].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!request.cookies.get("rea_gae_session") && !pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
