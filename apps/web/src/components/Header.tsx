"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="text-2xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent"
        >
          Mira
        </Link>
        <div className="flex items-center gap-4">
          {user && isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            isHomePage && (
              <Button asChild>
                <Link href="/login">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
