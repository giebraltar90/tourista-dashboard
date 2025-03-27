
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { CalendarIcon, Clock, Map, Tag } from "lucide-react";
import { format, isValid } from "date-fns";

interface TourInfoGridProps {
  tour: TourCardProps;
}

export const TourInfoGrid = ({ tour }: TourInfoGridProps) => {
  // Format the date properly, handling both Date objects and string dates
  const formatTourDate = (date: Date | string) => {
    try {
      // Convert string dates to Date objects
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid before formatting
      if (!isValid(dateObj)) {
        return "Invalid date";
      }
      
      return format(dateObj, 'PP');
    } catch (error) {
      console.error("Error formatting date:", error);
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
            <p className="font-semibold">{tour.startTime}</p>
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
            <p className="font-semibold">{tour.location}</p>
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
              {tour.tourType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
