
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

interface BucketDateFieldProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function BucketDateField({ date, onDateChange }: BucketDateFieldProps) {
  // Log initial date
  useEffect(() => {
    console.log("🔍 [BucketDateField] Initial date:", {
      date: date.toISOString(),
      components: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        dayOfWeek: date.getDay(),
        timezoneOffset: date.getTimezoneOffset()
      }
    });
  }, []);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    console.log("🔍 [BucketDateField] Selected date from calendar:", {
      newDate: newDate.toISOString(),
      components: {
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
        day: newDate.getDate(),
        dayOfWeek: newDate.getDay(),
        formatted: format(newDate, 'PPP')
      }
    });
    
    // Apply the selection to parent component
    onDateChange(newDate);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="date">Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            id="date"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Select a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
