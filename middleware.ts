import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { BFF_SESSION_COOKIE } from "@/app/lib/auth/session";

export function middleware(request: NextRequest): Response {
  const hasSession = Boolean(request.cookies.get(BFF_SESSION_COOKIE)?.value);

  // Apply an early auth gate at the edge to avoid rendering protected pages for
  // anonymous users and improve UX with immediate navigation feedback.
  if (hasSession) {
    return NextResponse.next();
  }

  // Keep API responses semantically correct: the BFF route still returns 401 as
  // the final authority, while middleware blocks unauthenticated access early.
  // Token validation is intentionally not done here because edge middleware
  // should remain lightweight and the BFF route owns full auth checks.
  if (request.nextUrl.pathname.startsWith("/api/bff/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/bff/:path*"],
};
