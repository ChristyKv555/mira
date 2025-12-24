import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public API routes that don't require authentication
// These routes are called by external services (e.g., Nango webhooks)
const PUBLIC_API_ROUTES = [
  "/api/nango/webhooks",
  // Add more public API routes here as needed
  // Example: "/api/public/webhook",
];

/**
 * Check if a pathname matches any public API route
 */
function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This refreshes the session automatically using the cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ROUTE PROTECTION LOGIC
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isPublicAsset = request.nextUrl.pathname.match(
    /\.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2)$/
  );
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");
  const isPublicApi = isPublicApiRoute(request.nextUrl.pathname);

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (
    !user &&
    !isAuthPage &&
    !isApiRoute &&
    !isPublicAsset &&
    !isAuthCallback &&
    request.nextUrl.pathname !== "/"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // --- API ROUTE HANDLING ---
  if (isApiRoute) {
    // Handle OPTIONS requests for CORS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With, x-user-id, x-user-email, x-nango-signature, x-nango-hmac-sha256",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Public API routes: skip authentication, allow through with CORS headers
    if (isPublicApi) {
      const publicResponse = NextResponse.next();
      publicResponse.headers.set("Access-Control-Allow-Origin", "*");
      publicResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      publicResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-nango-signature, x-nango-hmac-sha256"
      );
      return publicResponse;
    }

    // Protected API routes: require authentication
    if (user) {
      // Inject user info into headers for authenticated API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.id);
      requestHeaders.set("x-user-email", user.email || "");

      const authResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Add CORS headers for authenticated routes too
      authResponse.headers.set("Access-Control-Allow-Origin", "*");
      authResponse.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      authResponse.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-user-id, x-user-email"
      );

      return authResponse;
    } else {
      // No user and not a public route: return 401
      const errorResponse = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      return errorResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
