
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { TourCardGuide } from "./TourCardGuide";
import { TourCardCapacity } from "./TourCardCapacity";
import { TourCardDetailsProps } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const TourCardDetails: React.FC<TourCardDetailsProps> = ({
  guide1,
  guide2,
  guide1Info,
  guide2Info,
  location,
  tourGroups,
  totalParticipants,
  isHighSeason
}) => {
  const capacity = isHighSeason ? 36 : 24;
  
  return (
    <CardContent className="p-4 pt-2 pb-3">
      <div className="flex flex-wrap gap-y-2">
        <div className="w-full flex flex-col">
          <TourCardGuide 
            guideName={guide1} 
            guideInfo={guide1Info} 
          />
          
          {guide2 && (
            <TourCardGuide 
              guideName={guide2} 
              guideInfo={guide2Info} 
              isSecondary
            />
          )}
        </div>
        
        <div className="w-1/2 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="w-full mt-1">
          <div className="flex items-center gap-1.5">
            {tourGroups.map((group, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="flex items-center">
                      <span className="mr-1">{group.name}</span>
                      <span className="bg-background/80 px-1.5 rounded-sm text-xs">
                        {group.size}
                      </span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Entry: {group.entryTime}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
      
      <TourCardCapacity 
        totalParticipants={totalParticipants} 
        capacity={capacity} 
      />
    </CardContent>
  );
};
