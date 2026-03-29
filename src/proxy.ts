import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/dashboard", "/chat", "/plan", "/log", "/settings", "/billing"];
const authPrefixes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  if (!isSupabaseConfigured) {
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuth = authPrefixes.some((prefix) => pathname.startsWith(prefix));
  const hasSupabaseSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));

  if (isProtected && !hasSupabaseSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && hasSupabaseSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/plan/:path*",
    "/log/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
