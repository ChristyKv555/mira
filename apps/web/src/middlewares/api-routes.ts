import { NextResponse, type NextRequest } from "next/server";
import type { User } from "./auth";
import { isApiRoute } from "./route-types";

/**
 * Public API routes that don't require authentication
 * Add routes here to make them publicly accessible
 */
export const PUBLIC_API_ROUTES = [
  "/api/integrations/webhook", // Nango webhook endpoint (signature verified internally)
] as const;

/**
 * Checks if an API route is public (doesn't require authentication)
 */
export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Handles API route authentication and user injection
 * - Public routes: Allow access without authentication
 * - Protected routes: Require authentication and inject user headers
 */
export function handleApiRoute(
  request: NextRequest,
  user: User | null,
  originalResponse?: NextResponse
): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Only handle API routes
  if (!isApiRoute(pathname)) {
    return null;
  }

  // Public API routes don't require authentication
  if (isPublicApiRoute(pathname)) {
    // Preserve cookies from original response if provided
    return originalResponse || NextResponse.next();
  }

  // Protected API routes require authentication
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Inject user data into request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email || "");

  // Create new response with modified headers, preserving cookies from original response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copy cookies from original response if provided
  if (originalResponse) {
    originalResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
  }

  return response;
}
