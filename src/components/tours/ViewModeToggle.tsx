
import React from "react";
import { Button } from "@/components/ui/button";
import { ListFilter, CalendarDays } from "lucide-react";

interface ViewModeToggleProps {
  viewMode: "all" | "calendar";
  onChange: (mode: "all" | "calendar") => void;
}

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-2 ml-2">
      <Button 
        variant={viewMode === "all" ? "default" : "outline"} 
        size="sm"
        onClick={() => onChange("all")}
      >
        <ListFilter className="mr-2 h-4 w-4" />
        All Tours
      </Button>
      <Button 
        variant={viewMode === "calendar" ? "default" : "outline"} 
        size="sm"
        onClick={() => onChange("calendar")}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        Calendar View
      </Button>
    </div>
  );
}
