import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/callback", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("insforge-auth-token")?.value;

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    if (authToken && (pathname === "/auth/login" || pathname === "/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!authToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
