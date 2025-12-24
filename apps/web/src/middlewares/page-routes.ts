import { NextResponse, type NextRequest } from "next/server";
import type { User } from "./auth";
import {
  isAuthPage,
  isPublicAsset,
  isAuthCallback,
  isHomePage,
} from "./route-types";

/**
 * Handles page route protection and redirects
 * - Authenticated users accessing auth pages → redirect to dashboard
 * - Unauthenticated users accessing protected pages → redirect to login
 */
export function handlePageRoute(
  request: NextRequest,
  user: User | null,
  pathname: string,
  originalResponse?: NextResponse
): NextResponse | null {
  // Skip handling for API routes (handled separately)
  if (pathname.startsWith("/api")) {
    return null;
  }

  // Allow public assets and auth callback
  if (isPublicAsset(pathname) || isAuthCallback(pathname)) {
    return null; // Let it pass through
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage(pathname)) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    // Preserve cookies from original response
    if (originalResponse) {
      originalResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
    }
    return redirectResponse;
  }

  // Redirect unauthenticated users to login for protected routes
  if (
    !user &&
    !isAuthPage(pathname) &&
    !isHomePage(pathname) // Allow home page without auth
  ) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    // Preserve cookies from original response
    if (originalResponse) {
      originalResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
    }
    return redirectResponse;
  }

  // Allow the request to proceed
  return null;
}
