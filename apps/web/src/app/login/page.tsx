"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkUser();

    // Listen for auth state changes (login/signup)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Custom theme matching app colors
  const customTheme = {
    ...ThemeSupa,
    default: {
      ...ThemeSupa.default,
      colors: {
        ...ThemeSupa.default?.colors,
        brand: "hsl(var(--primary))",
        brandAccent: "hsl(var(--primary))",
        brandButtonText: "hsl(var(--primary-foreground))",
        defaultButtonBackground: "hsl(var(--secondary))",
        defaultButtonBackgroundHover: "hsl(var(--secondary))",
        defaultButtonBorder: "hsl(var(--border))",
        defaultButtonText: "hsl(var(--foreground))",
        dividerBackground: "hsl(var(--border))",
        inputBackground: "hsl(var(--background))",
        inputBorder: "hsl(var(--input))",
        inputBorderHover: "hsl(var(--ring))",
        inputBorderFocus: "hsl(var(--ring))",
        inputText: "hsl(var(--foreground))",
        inputLabelText: "hsl(var(--foreground))",
        inputPlaceholder: "hsl(var(--muted-foreground))",
        messageText: "hsl(var(--muted-foreground))",
        messageTextDanger: "hsl(var(--destructive))",
        anchorTextColor: "hsl(var(--primary))",
        anchorTextHoverColor: "hsl(var(--primary))",
      },
      space: {
        ...ThemeSupa.default?.space,
        spaceSmall: "0.5rem",
        spaceMedium: "1rem",
        spaceLarge: "1.5rem",
        labelBottomMargin: "0.5rem",
        anchorBottomMargin: "0.5rem",
        emailInputSpacing: "0.75rem",
        socialAuthSpacing: "0.75rem",
        buttonPadding: "0.625rem 1rem",
        inputPadding: "0.625rem 1rem",
      },
      fontSizes: {
        ...ThemeSupa.default?.fontSizes,
        baseBodySize: "0.875rem",
        baseInputSize: "0.875rem",
        baseLabelSize: "0.875rem",
        baseButtonSize: "0.875rem",
      },
      fonts: {
        ...ThemeSupa.default?.fonts,
        bodyFontFamily: "var(--font-geist-sans)",
        buttonFontFamily: "var(--font-geist-sans)",
        inputFontFamily: "var(--font-geist-sans)",
        labelFontFamily: "var(--font-geist-sans)",
      },
      borderWidths: {
        ...ThemeSupa.default?.borderWidths,
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        ...ThemeSupa.default?.radii,
        borderRadiusButton: "var(--radius)",
        buttonBorderRadius: "var(--radius)",
        inputBorderRadius: "var(--radius)",
        labelBorderRadius: "var(--radius)",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-6 border rounded-xl shadow-md bg-card">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Mira</h1>
        <Auth
          providers={[]}
          supabaseClient={supabase}
          appearance={{ theme: customTheme }}
          redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`}
        />
      </div>
    </div>
  );
}
