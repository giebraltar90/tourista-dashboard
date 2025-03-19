
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, Bell, Search, Settings, User, LogOut } from "lucide-react";
import { RoleSwitcher } from "./RoleSwitcher";
import { useRole } from "@/contexts/RoleContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

// Demo notifications data
const notifications = [
  { id: 1, title: "New booking", description: "Tour #1234 has a new booking", time: "10 mins ago" },
  { id: 2, title: "Guide update", description: "Maria Lopez updated her availability", time: "30 mins ago" },
  { id: 3, title: "Tour cancelled", description: "City tour on May 15 was cancelled", time: "1 hour ago" },
  { id: 4, title: "System update", description: "New features available", time: "Yesterday" },
];

export function TopBar({ sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const { guideView, role } = useRole();
  
  // Get the profile initials for avatar fallback
  const getInitials = () => {
    if (guideView) {
      return guideView.guideName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return "OP"; // Operator
  };
  
  // Determine profile route based on role
  const profileRoute = guideView ? "/guide/profile" : "/settings";
  
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
              alt="Boutique Tours Logo" 
              className="h-8"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Boutique Tours</h1>
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
          {/* Search Bar */}
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 w-full bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>
          
          {/* Notifications */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center" variant="destructive">
                    {notifications.length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2 gap-1">
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center justify-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <RoleSwitcher />
          
          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={profileRoute} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
