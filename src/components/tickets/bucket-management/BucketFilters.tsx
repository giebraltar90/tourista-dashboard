
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BucketFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function BucketFilters({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange
}: BucketFiltersProps) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="relative flex-1 sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search buckets..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {selectedDate && (
        <Button variant="outline" size="sm" onClick={() => onDateChange(undefined)}>
          Clear
        </Button>
      )}
    </div>
  );
}
