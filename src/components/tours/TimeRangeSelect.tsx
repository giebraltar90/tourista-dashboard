
import React from "react";
import { TimeRangeType } from "@/hooks/useTourFilters";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListFilter,
  Calendar as CalendarIcon,
  CalendarRange
} from "lucide-react";

interface TimeRangeSelectProps {
  value: TimeRangeType;
  onChange: (value: TimeRangeType) => void;
}

export function TimeRangeSelect({ value, onChange }: TimeRangeSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={(value: TimeRangeType) => onChange(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Time Range</SelectLabel>
          <SelectItem value="all">
            <div className="flex items-center">
              <ListFilter className="mr-2 h-4 w-4" />
              <span>All</span>
            </div>
          </SelectItem>
          <SelectItem value="today">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Today</span>
            </div>
          </SelectItem>
          <SelectItem value="tomorrow">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Tomorrow</span>
            </div>
          </SelectItem>
          <SelectItem value="this-week">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>This Week</span>
            </div>
          </SelectItem>
          <SelectItem value="next-week">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Next Week</span>
            </div>
          </SelectItem>
          <SelectItem value="this-month">
            <div className="flex items-center">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>This Month</span>
            </div>
          </SelectItem>
          <SelectItem value="next-month">
            <div className="flex items-center">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>Next Month</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
