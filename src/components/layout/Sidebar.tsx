
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Bike, 
  Users, 
  Ticket, 
  Map, 
  Settings, 
  MessageSquare,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Calendar },
  { name: "Tours", href: "/tours", icon: Bike },
  { name: "Guides", href: "/guides", icon: Users },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Locations", href: "/locations", icon: Map },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className={cn(
        "fixed left-0 top-[64px] bottom-0 transition-all duration-300 ease-in-out z-30",
        "bg-white shadow-sm border-r border-border flex flex-col",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const isHovered = hoveredItem === item.name;
          
          return (
            <Link 
              key={item.name}
              to={item.href}
              className="sidebar-item block"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                size="lg"
                className={cn(
                  "w-full justify-start mb-1 group relative overflow-hidden transition-all duration-300",
                  isActive ? 
                    "bg-primary text-primary-foreground" : 
                    "text-muted-foreground hover:text-foreground",
                  collapsed ? "px-0 justify-center" : ""
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-primary opacity-0 transition-opacity duration-300",
                  (isHovered && !isActive) && "opacity-5"
                )} />
                
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-all duration-300",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                  collapsed ? "mr-0" : "mr-3"
                )} />
                
                {!collapsed && (
                  <span className="text-base font-medium">
                    {item.name}
                  </span>
                )}
                
                {!collapsed && isActive && (
                  <ChevronRight className="ml-auto h-5 w-5 text-primary-foreground" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className={cn(
        "p-4 border-t border-border transition-opacity duration-300",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="text-xs text-muted-foreground">
          <p>Tourista Operations Dashboard</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
