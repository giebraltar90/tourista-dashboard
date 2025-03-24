
import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({
  children,
  title,
}: DashboardLayoutProps) => {
  const { role } = useRole();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={title} />
      <div className="flex flex-1">
        <div className="hidden border-r md:block">
          <Sidebar className="w-64" />
        </div>
        <main
          className={cn(
            "flex-1 p-4 md:p-6",
            role === "admin" && "bg-slate-50 dark:bg-slate-900"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
