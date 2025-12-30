"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const supabase = createClient();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
    router.push("/");
    router.refresh();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signOut,
  };
}

