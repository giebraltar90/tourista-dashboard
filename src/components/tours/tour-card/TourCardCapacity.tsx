
import React from "react";
import { cn } from "@/lib/utils";

interface TourCardCapacityProps {
  totalParticipants: number;
  capacity: number;
}

export const TourCardCapacity: React.FC<TourCardCapacityProps> = ({ 
  totalParticipants, 
  capacity 
}) => {
  const capacityPercentage = Math.round((totalParticipants / capacity) * 100);
  
  return (
    <div className="mt-3 w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">Capacity</span>
        <span className={cn(
          capacityPercentage > 90 ? "text-red-500" : 
          capacityPercentage > 75 ? "text-amber-500" : 
          "text-green-500"
        )}>
          {totalParticipants}/{capacity}
        </span>
      </div>
      <div className="w-full bg-secondary/30 rounded-full h-1.5">
        <div 
          className={cn(
            "h-1.5 rounded-full",
            capacityPercentage > 90 ? "bg-red-500" : 
            capacityPercentage > 75 ? "bg-amber-500" : 
            "bg-green-500"
          )} 
          style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};
