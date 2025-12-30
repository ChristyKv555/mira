import type { NextRequest } from "next/server";

/**
 * Checks if the route is an authentication page (login, signup, etc.)
 */
export function isAuthPage(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}

/**
 * Checks if the route is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

/**
 * Checks if the route is a public asset (images, fonts, etc.)
 */
export function isPublicAsset(pathname: string): boolean {
  return !!pathname.match(/\.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2)$/);
}

/**
 * Checks if the route is an auth callback route
 */
export function isAuthCallback(pathname: string): boolean {
  return pathname.startsWith("/auth/callback");
}

/**
 * Checks if the route is the home/landing page
 */
export function isHomePage(pathname: string): boolean {
  return pathname === "/";
}

/**
 * Gets route type information for a given request
 */
export function getRouteInfo(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  return {
    pathname,
    isAuthPage: isAuthPage(pathname),
    isApiRoute: isApiRoute(pathname),
    isPublicAsset: isPublicAsset(pathname),
    isAuthCallback: isAuthCallback(pathname),
    isHomePage: isHomePage(pathname),
  };
}

