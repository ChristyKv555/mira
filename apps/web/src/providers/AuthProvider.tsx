"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, logout, setLoading } from "@/store/slices/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const supabase = createClient();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const redirectHandledRef = useRef(false);
  const pathnameRef = useRef(pathname);

  // Initial user check - runs only once on mount
  useEffect(() => {
    let isMounted = true;

    // Initial user check
    const checkUser = async () => {
      try {
        dispatch(setLoading(true));
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          if (user && session) {
            dispatch(
              setCredentials({
                user: {
                  id: user.id,
                  email: user.email || "",
                  name: user.user_metadata?.name || user.email?.split("@")[0],
                },
              })
            );
          } else {
            dispatch(logout());
          }
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error("Error checking user:", error);
        if (isMounted) {
          dispatch(logout());
          dispatch(setLoading(false));
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [supabase, dispatch]);

  // Set up auth state change listener - runs only once on mount
  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      switch (event) {
        case "SIGNED_IN":
          if (session?.user) {
            dispatch(
              setCredentials({
                user: {
                  id: session.user.id,
                  email: session.user.email || "",
                  name:
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0],
                },
              })
            );

            // Redirect logic: if on login page, redirect to dashboard
            if (
              pathnameRef.current === "/login" &&
              !redirectHandledRef.current
            ) {
              redirectHandledRef.current = true;
              router.push("/dashboard");
              router.refresh();
            }
          }
          break;

        case "SIGNED_OUT":
          dispatch(logout());
          // Redirect logic: if on protected route, redirect to login
          if (
            pathnameRef.current?.startsWith("/dashboard") &&
            !redirectHandledRef.current
          ) {
            redirectHandledRef.current = true;
            router.push("/login");
            router.refresh();
          }
          break;

        case "TOKEN_REFRESHED":
          if (session?.user) {
            dispatch(
              setCredentials({
                user: {
                  id: session.user.id,
                  email: session.user.email || "",
                  name:
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0],
                },
              })
            );
          }
          break;

        case "USER_UPDATED":
          if (session?.user) {
            dispatch(
              setCredentials({
                user: {
                  id: session.user.id,
                  email: session.user.email || "",
                  name:
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0],
                },
              })
            );
          }
          break;
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase, dispatch, router]);

  // Update pathname ref and reset redirect flag when pathname changes (without re-running auth checks)
  useEffect(() => {
    pathnameRef.current = pathname;
    redirectHandledRef.current = false;
  }, [pathname]);

  return <>{children}</>;
}
