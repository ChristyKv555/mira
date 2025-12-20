import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

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
