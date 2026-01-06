import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "./middlewares/supabase";
import { getAuthenticatedUser } from "./middlewares/auth";
import { getRouteInfo, isApiRoute } from "./middlewares/route-types";
import { handleApiRoute, isPublicApiRoute } from "./middlewares/api-routes";
import { handlePageRoute } from "./middlewares/page-routes";

export default async function Proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  if (isApiRoute(pathname) && isPublicApiRoute(pathname)) {
    return handleApiRoute(request, null, response);
  }

  // Create Supabase client for middleware
  const supabase = createMiddlewareSupabaseClient(request, response);

  // Get authenticated user (only for protected routes)
  const user = await getAuthenticatedUser(supabase);

  // Get route information
  const routeInfo = getRouteInfo(request);

  // Handle API routes (public routes, auth, user injection)
  const apiResponse = handleApiRoute(request, user, response);
  if (apiResponse) {
    return apiResponse;
  }

  // Handle page routes (redirects, protection)
  const pageResponse = handlePageRoute(
    request,
    user,
    routeInfo.pathname,
    response
  );
  if (pageResponse) {
    return pageResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
