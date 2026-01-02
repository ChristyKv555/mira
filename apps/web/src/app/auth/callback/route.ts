import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Gets the correct origin/URL for redirects, handling ngrok and other proxies
 * Checks for forwarded headers first, then falls back to request URL
 */
function getRedirectOrigin(request: Request): string {
  const requestUrl = new URL(request.url);

  // Check for x-forwarded-host header (set by ngrok and other proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    // Use forwarded protocol and host
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Check for environment variable override
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fall back to request origin
  return requestUrl.origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = getRedirectOrigin(request);

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Verify user session exists before redirecting
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // URL to redirect to after sign in process completes
  if (user) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // If no user, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
