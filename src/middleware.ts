import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_REDIRECT } from "./lib/routes";
import { PUBLIC_ROUTES } from "./lib/routes";

export { default } from "next-auth/middleware"

export const config = { matcher: ["/protected", "/entry"] }