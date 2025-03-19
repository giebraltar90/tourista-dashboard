
import React, { useMemo } from "react";
import { TourCardProps } from "@/components/tours/TourCard";
import { Calendar } from "@/components/ui/calendar";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { TimeRangeType } from "@/hooks/useTourFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isSameDay } from "date-fns";

interface CalendarViewProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  tours: TourCardProps[];
  timeRange: TimeRangeType;
}

export function CalendarView({ date, onDateChange, tours, timeRange }: CalendarViewProps) {
  // Create a Set of dates that have tours to pass to the Calendar component
  const datesWithTours = useMemo(() => {
    return tours.map(tour => tour.date);
  }, [tours]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Select Date</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="rounded-md border"
          components={{
            DayContent: ({ day, date: dayDate }) => {
              const hasTourOnDay = tours.some(tour => isSameDay(tour.date, dayDate));
              return (
                <div className="relative h-full w-full flex flex-col items-center justify-center">
                  <div>{dayDate.getDate()}</div>
                  {hasTourOnDay && (
                    <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </div>
              );
            }
          }}
        />
      </div>
      <div className="md:col-span-2">
        <h3 className="text-sm font-medium mb-3">
          {timeRange === "this-week" || timeRange === "next-week"
            ? "Tours this Week" 
            : timeRange === "this-month" || timeRange === "next-month"
              ? "Tours this Month" 
              : "Tours on Selected Date"}
        </h3>
        {tours.length > 0 ? (
          <div className="space-y-4">
            <UpcomingTours tours={tours} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
            <div className="text-center">
              <p className="text-muted-foreground">
                {timeRange === "this-week" || timeRange === "next-week"
                  ? "No tours scheduled for this week" 
                  : timeRange === "this-month" || timeRange === "next-month"
                    ? "No tours scheduled for this month" 
                    : "No tours scheduled for this date"}
              </p>
              <Button variant="link" size="sm" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Tour
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
