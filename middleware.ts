import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login",];

/** Extensiones servidas desde /public; no deben pasar por la lógica de sesión */
const PUBLIC_STATIC_EXT = /\.(ico|png|jpe?g|gif|webp|svg|woff2?|ttf|eot|txt|xml)$/i;

export function middleware(request: NextRequest) {
  const token = request.cookies.get("fna_access_token")?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_STATIC_EXT.test(pathname)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};