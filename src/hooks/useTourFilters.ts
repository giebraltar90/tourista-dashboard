
import { useState } from "react";
import { TourCardProps } from "@/components/tours/TourCard";
import { 
  addDays, 
  isWithinInterval, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  isTomorrow, 
  addWeeks, 
  addMonths,
  isSameDay 
} from "date-fns";

// Define the time range type
export type TimeRangeType = "all" | "today" | "tomorrow" | "this-week" | "next-week" | "this-month" | "next-month";

export function useTourFilters(tours: TourCardProps[]) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"all" | "calendar">("all");
  const [timeRange, setTimeRange] = useState<TimeRangeType>("all");
  
  // Filter tours based on selected date if in calendar view
  let filteredTours = viewMode === "calendar" && date
    ? tours.filter(tour => 
        isSameDay(tour.date, date)
      )
    : tours;
  
  // Apply time range filters
  if (timeRange !== "all") {
    const today = new Date();
    
    if (timeRange === "today") {
      filteredTours = tours.filter(tour => isToday(tour.date));
    } 
    else if (timeRange === "tomorrow") {
      filteredTours = tours.filter(tour => isTomorrow(tour.date));
    } 
    else if (timeRange === "this-week") {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      
      filteredTours = tours.filter(tour => 
        isWithinInterval(tour.date, { start: weekStart, end: weekEnd })
      );
    } 
    else if (timeRange === "next-week") {
      const nextWeekStart = startOfWeek(addWeeks(today, 1));
      const nextWeekEnd = endOfWeek(addWeeks(today, 1));
      
      filteredTours = tours.filter(tour => 
        isWithinInterval(tour.date, { start: nextWeekStart, end: nextWeekEnd })
      );
    } 
    else if (timeRange === "this-month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      filteredTours = tours.filter(tour => 
        isWithinInterval(tour.date, { start: monthStart, end: monthEnd })
      );
    } 
    else if (timeRange === "next-month") {
      const nextMonthStart = startOfMonth(addMonths(today, 1));
      const nextMonthEnd = endOfMonth(addMonths(today, 1));
      
      filteredTours = tours.filter(tour => 
        isWithinInterval(tour.date, { start: nextMonthStart, end: nextMonthEnd })
      );
    }
  }
  
  return {
    date,
    setDate,
    viewMode,
    setViewMode,
    timeRange,
    setTimeRange,
    filteredTours
  };
}
