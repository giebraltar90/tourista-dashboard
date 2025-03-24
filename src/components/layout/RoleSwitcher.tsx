
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/contexts/RoleContext";
import { User, Users } from "lucide-react";

export const RoleSwitcher = () => {
  const { role, setRole, guideName } = useRole();
  const [guideNameInput, setGuideNameInput] = useState("");

  const handleRoleChange = (newRole: string, details?: any) => {
    setRole(newRole, details);
  };

  const handleGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guideNameInput.trim()) {
      handleRoleChange("guide", { 
        guideName: guideNameInput.trim() 
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <User className="h-4 w-4" />
          <span>{role === "guide" && guideName ? guideName : role}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleRoleChange("user")}
          className={role === "user" ? "bg-accent" : ""}
        >
          <User className="mr-2 h-4 w-4" /> User
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("admin")}
          className={role === "admin" ? "bg-accent" : ""}
        >
          <Users className="mr-2 h-4 w-4" /> Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <form onSubmit={handleGuideSubmit} className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Guide Name"
              value={guideNameInput}
              onChange={(e) => setGuideNameInput(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            />
            <Button type="submit" size="sm" className="w-full">
              Switch to Guide
            </Button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
