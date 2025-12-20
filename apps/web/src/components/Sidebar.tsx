"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  CheckSquare,
  Plug,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./SidebarContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
  },
  {
    label: "Connect",
    href: "/dashboard/connect",
    icon: Plug,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = (email: string | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (email: string | undefined) => {
    if (!email) return "User";
    const name = email.split("@")[0];
    return name
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <div className="relative">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header Section */}
        <div className="flex h-16 items-center border-b px-4">
          {isCollapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black dark:bg-white text-white dark:text-black font-bold text-lg mx-auto">
              M
            </div>
          ) : (
            <h1 className="text-2xl font-bold bg-linear-to-r from-foreground via-foreground/60 to-foreground bg-clip-text text-transparent tracking-tight animate-gradient bg-size-[200%_auto] transition-all duration-300 hover:scale-105">
              Mira
            </h1>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section with Dropdown */}
        {user && (
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start hover:bg-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                    {getUserInitials(user.email)}
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0 text-left ml-3">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getUserDisplayName(user.email)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isCollapsed ? "start" : "end"}
                side={isCollapsed ? "right" : "top"}
                className="w-48"
              >
                <DropdownMenuItem onClick={() => {}}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Toggle Button - Protruding from right edge, aligned with first sidebar item */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "fixed z-50 h-6 w-6 rounded-full border-2 bg-background shadow-md hover:bg-accent transition-all duration-300",
          isCollapsed ? "left-[72px] top-[88px]" : "left-[248px] top-[88px]"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
