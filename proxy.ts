import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/sign-in"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (PUBLIC_PATHS.has(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!PUBLIC_PATHS.has(pathname) && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
