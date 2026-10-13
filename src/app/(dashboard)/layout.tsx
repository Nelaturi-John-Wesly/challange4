import { DashboardShell } from "@/components/layout/DashboardShell";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}

