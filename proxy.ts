import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        if (token?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        } else if (token?.role === "USER") {
          return NextResponse.redirect(new URL("/dashboard/user", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role Based Access Control (RBAC)
    if (req.nextUrl.pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // Atur logic default dashboard atau ke forbidden/unauthorized halaman jika bukan Admin
    }

    if (req.nextUrl.pathname.startsWith("/dashboard/user") && token?.role !== "USER") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); 
    }
  },
  {
    callbacks: {
      async authorized() {
        // middleware function above akan mereturn response untuk nextjs redirect, yang function return true, masuk ke block `function middleware(req)`
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
