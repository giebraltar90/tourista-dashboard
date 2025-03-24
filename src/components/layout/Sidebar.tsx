
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TicketIcon,
  Calendar,
  Users,
  Settings,
  Mail,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

interface SidebarProps {
  className?: string;
}

// Define navigation items
const getNavItems = (role: string, guideName: string | null) => {
  // Common items for all roles
  const commonItems = [
    {
      name: "Tours",
      href: "/tours",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  // Guide-specific items
  const guideItems = [
    {
      name: "Messages",
      href: "/guide/messages",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/guide/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  // Admin-specific items
  const adminItems = [
    {
      name: "Guides",
      href: "/admin/guides",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Return navigation items based on role
  if (role === "guide") {
    return [...commonItems, ...guideItems];
  } else if (role === "admin") {
    return [...commonItems, ...adminItems];
  }

  // Default for user role
  return commonItems;
};

export function Sidebar({ className }: SidebarProps) {
  const { role, guideName } = useRole();
  const location = useLocation();
  const navItems = getNavItems(role, guideName);

  return (
    <div className={cn("pb-12 h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            {role === "guide" && guideName
              ? `Guide: ${guideName}`
              : role === "admin"
              ? "Admin Panel"
              : "Tour Management"}
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={
                    location.pathname === item.href ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
