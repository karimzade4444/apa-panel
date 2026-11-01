import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Proxy logic goes here
  // const { pathname } = request.nextUrl;
  // console.log(`Proxying request for: ${pathname}`);

  // // if (request.nextUrl.pathname.startsWith("/")) {
  // //   return NextResponse.rewrite(new URL("/login", request.url));
  // // }
  //  const allCookies = request.cookies.get("accessToken")?.value;
  // console.log("All cookies:", allCookies);

  const token = request.cookies.get("accessToken")?.value;

  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    // If the token is not present, redirect to the login page
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && request.nextUrl.pathname.startsWith("/login")) {

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
