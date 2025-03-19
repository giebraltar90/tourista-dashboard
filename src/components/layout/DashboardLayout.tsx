
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Set page title based on current route
  useEffect(() => {
    let title = "Operations Dashboard";
    
    if (location.pathname.includes("/tours")) {
      if (location.pathname === "/tours") {
        title = "Tours Management";
      } else {
        title = "Tour Details";
      }
    } else if (location.pathname.includes("/guides")) {
      title = "Guide Management";
    } else if (location.pathname.includes("/tickets")) {
      title = "Ticket Management";
    }
    
    document.title = `${title} | Tour Operations`;
  }, [location]);
  
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
          "p-4 md:p-6 pt-20", // Added pt-20 for extra top padding to prevent content from being cut off
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
