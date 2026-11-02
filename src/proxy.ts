import { NextRequest, NextResponse } from "next/server";

const publicAssetExtensions =
  /\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp|mp4|webm|woff2?|ttf|otf|css|js)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/favicon") ||
    publicAssetExtensions.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;

  if (!token && !pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|images|icons|favicon|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|bmp|mp4|webm|woff2?|ttf|otf|css|js)$).*)",
  ],
};
