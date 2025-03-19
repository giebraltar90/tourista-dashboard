
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export function ToursPageHeader() {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage all your tours, guides, and participant groups
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Tour
        </Button>
      </div>
    </div>
  );
}
