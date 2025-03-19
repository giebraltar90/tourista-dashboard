
import React from "react";
import { TimeRangeType } from "@/hooks/useTourFilters";
import { TimeRangeSelect } from "./TimeRangeSelect";
import { ViewModeToggle } from "./ViewModeToggle";

interface TourFiltersProps {
  timeRange: TimeRangeType;
  onTimeRangeChange: (value: TimeRangeType) => void;
  viewMode: "all" | "calendar";
  onViewModeChange: (mode: "all" | "calendar") => void;
}

export function TourFilters({ 
  timeRange, 
  onTimeRangeChange, 
  viewMode, 
  onViewModeChange 
}: TourFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TimeRangeSelect value={timeRange} onChange={onTimeRangeChange} />
      <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
    </div>
  );
}
