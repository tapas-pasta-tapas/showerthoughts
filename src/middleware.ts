import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_REDIRECT } from "./lib/routes";
import { PUBLIC_ROUTES } from "./lib/routes";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token");
  const { nextUrl } = request;

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};