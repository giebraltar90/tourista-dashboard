
import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { role, guideView } = useRole();
  
  // Restrict access based on role
  const isGuideRoute = location.pathname.startsWith("/guide");
  const isOperatorOnlyRoute = !location.pathname.startsWith("/tours") && 
                             !location.pathname.startsWith("/guide") &&
                             !location.pathname.startsWith("/messages") &&
                             !location.pathname.startsWith("/settings");
  
  // If guide tries to access operator-only routes
  if ((role === "guide" || guideView) && isOperatorOnlyRoute) {
    return <Navigate to={guideView ? "/tours" : "/guide"} replace />;
  }
  
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
    } else if (location.pathname.includes("/guide")) {
      title = "Guide Portal";
    }
    
    document.title = `${title} | Boutique Tours`;
  }, [location]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added pt-16 here to account for the fixed header */}
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out overflow-auto",
          "p-6", // Simplified padding
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
