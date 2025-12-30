"use client";

import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
