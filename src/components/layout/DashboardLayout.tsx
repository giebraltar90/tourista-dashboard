
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto",
          "p-4 md:p-6",
          sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
        )}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
