
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import { Tag, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourCardHeaderProps } from "./types";

export const TourCardHeader: React.FC<TourCardHeaderProps> = ({ 
  tourName, 
  location, 
  referenceCode, 
  startTime,
  date,
  isHovered 
}) => {
  const locationFormatted = location.split(' ')[0].toUpperCase();
  const dayOfWeek = format(date, 'EEE'); // This formats the date to show the day of the week (e.g., "Mon", "Tue")
  const formattedDate = format(date, 'dd.MM.'); // This formats the date as day.month. (e.g., "13.04.")
  
  return (
    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
      <div>
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2 bg-secondary/50">
            {locationFormatted}
          </Badge>
          <h3 className="font-medium text-base">{tourName}</h3>
        </div>
        <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
          <Tag className="h-3 w-3 mr-1" />
          <span>#{referenceCode}</span>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center text-sm font-medium">
          <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <span>{startTime}</span>
          <Calendar className="h-3.5 w-3.5 ml-2 mr-1 text-muted-foreground" />
          <span>{dayOfWeek}, {formattedDate}</span>
        </div>
      </div>
    </CardHeader>
  );
};
