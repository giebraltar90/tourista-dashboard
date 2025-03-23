
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Map, 
  CalendarDays, 
  Settings, 
  Users, 
  MessagesSquare, 
  Ticket 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Tours",
      href: "/tours",
      icon: CalendarDays,
    },
    {
      title: "Guides",
      href: "/guides",
      icon: Users,
    },
    {
      title: "Tickets",
      href: "/tickets",
      icon: Ticket,
    },
    {
      title: "Locations",
      href: "/locations",
      icon: Map,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessagesSquare,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.href || 
                       (item.href !== "/" && location.pathname.startsWith(item.href));
        
        return (
          <Button
            key={index}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "justify-start",
              isActive 
                ? "bg-secondary font-medium text-secondary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            asChild
          >
            <Link to={item.href} className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
