import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// You must export a default function or a named function called 'middleware'
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based protection
    if (path.startsWith("/dashboard/teacher") && token?.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (path.startsWith("/classroom") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new  URL("/", req.url));
    }
  },
  {
    callbacks: {
      // This ensures the middleware only runs if the user is authenticated
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { 
  matcher: ["/dashboard/:path*", "/classroom/:path*"] 
};