import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/dashboard/user", req.url))
    }

    if (pathname.startsWith("/dashboard/user") && role === "ADMIN") {
      // Opt: Admins shouldn't be constrained, but just in case we enforce separation:
      return NextResponse.rewrite(new URL("/dashboard/admin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
