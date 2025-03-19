
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, Bell, Search } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const { guideView } = useRole();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-40 flex items-center px-4">
      <div className="flex items-center w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png" 
              alt="Tourista Logo" 
              className="h-8"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Tourista</h1>
              <p className="text-xs text-muted-foreground leading-none">
                {guideView ? "Guide Portal" : "Operations Dashboard"}
              </p>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "ml-auto flex items-center gap-4 transition-all duration-300",
          sidebarCollapsed ? "pr-4" : ""
        )}>
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
}
