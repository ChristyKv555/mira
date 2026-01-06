"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? 80 : 256;

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, sidebarWidth }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
