
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
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

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
  const capacity = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeason : 
    totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? 
      DEFAULT_CAPACITY_SETTINGS.exception : 
      DEFAULT_CAPACITY_SETTINGS.standard;
  
  // Calculate total child count across all groups
  const totalChildCount = tourGroups.reduce((sum, group) => sum + (group.childCount || 0), 0);
  
  return (
    <CardContent className="p-4 pt-2 pb-3">
      <div className="flex flex-wrap gap-y-2">
        <div className="w-full flex flex-col">
          {/* Only display guide1 if it exists */}
          {guide1 && (
            <TourCardGuide 
              guideName={guide1} 
              guideInfo={guide1Info} 
            />
          )}
          
          {/* Only display guide2 if it exists */}
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
            {tourGroups.sort((a, b) => {
              // Extract group numbers to maintain consistent ordering
              const getGroupNum = (group: any) => {
                if (group?.name) {
                  const match = group.name.match(/Group (\d+)/);
                  if (match && match[1]) {
                    return parseInt(match[1], 10);
                  }
                }
                return 999; // Default for groups without proper naming
              };
              
              return getGroupNum(a) - getGroupNum(b);
            }).map((group, index) => {
              // Extract the group number from the name for display
              let groupNumber = index + 1;
              if (group.name) {
                const match = group.name.match(/Group (\d+)/);
                if (match && match[1]) {
                  groupNumber = parseInt(match[1], 10);
                }
              }
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="flex items-center">
                        <span className="mr-1">Group {groupNumber}</span>
                        <span className="bg-background/80 px-1.5 rounded-sm text-xs">
                          {group.childCount && group.childCount > 0 ? 
                            `${group.size - group.childCount}+${group.childCount}` : 
                            group.size}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Entry: {group.entryTime}</p>
                      {group.childCount > 0 && (
                        <p>{group.childCount} {group.childCount === 1 ? 'child' : 'children'}</p>
                      )}
                      {group.guideId && (
                        <p>Guide assigned</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
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
