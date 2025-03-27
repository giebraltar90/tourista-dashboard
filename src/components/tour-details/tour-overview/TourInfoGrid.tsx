
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { CalendarIcon, Clock, Map, Tag } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { logger } from "@/utils/logger";

interface TourInfoGridProps {
  tour: TourCardProps;
}

export const TourInfoGrid = ({ tour }: TourInfoGridProps) => {
  // Format the date properly, handling both Date objects and string dates safely
  const formatTourDate = (date: Date | string | undefined | null) => {
    if (!date) {
      logger.warn("Tour date is null or undefined");
      return "Date unavailable";
    }
    
    try {
      // First determine what type of date we're working with
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        // Try to parse the date string using various methods
        if (date.includes('T')) {
          // ISO format likely
          dateObj = parseISO(date);
        } else {
          // Simple date format - force to noon UTC to avoid timezone issues
          dateObj = new Date(`${date}T12:00:00Z`);
        }
      } else {
        logger.error("Unsupported date format:", date);
        return "Date unavailable";
      }
      
      // Check if the date is valid before formatting
      if (!isValid(dateObj)) {
        logger.warn("Invalid date object created from:", date);
        return "Date unavailable";
      }
      
      return format(dateObj, 'PP');
    } catch (error) {
      logger.error("Error formatting date:", error);
      return "Date unavailable";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
            <p className="font-semibold">{formatTourDate(tour.date)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
            <p className="font-semibold">{tour.startTime || "Time unavailable"}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Map className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
            <p className="font-semibold">{tour.location || "Location unavailable"}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tour Type</h3>
            <Badge variant="outline" className="mt-1">
              {tour.tourType || "Standard"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
