
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import { Tag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourCardHeaderProps } from "./types";

export const TourCardHeader: React.FC<TourCardHeaderProps> = ({ 
  tourName, 
  location, 
  referenceCode, 
  startTime,
  isHovered 
}) => {
  const locationFormatted = location.split(' ')[0].toUpperCase();
  
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
          {startTime}
        </div>
      </div>
    </CardHeader>
  );
};
