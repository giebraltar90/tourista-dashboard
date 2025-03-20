
import React from "react";
import { Badge } from "@/components/ui/badge";
import { IdCard, CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TourCardGuideProps } from "./types";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { useGuideData } from "@/hooks/guides/useGuideData";

export const TourCardGuide: React.FC<TourCardGuideProps> = ({ 
  guideName, 
  guideInfo, 
  isSecondary = false 
}) => {
  const { guides = [] } = useGuideData() || { guides: [] };
  
  if (!guideName) return null;
  
  // Handle case when guideName is a UUID instead of an actual name
  let displayName = guideName;
  
  if (isValidUuid(guideName)) {
    // Try to find the actual guide name from our guides list
    const matchingGuide = guides.find(g => g.id === guideName);
    if (matchingGuide) {
      displayName = matchingGuide.name;
    } else {
      displayName = `Guide ${guideName.substring(0, 4)}...`;
    }
  }

  return (
    <div className="flex items-center mt-1">
      {!isSecondary && (
        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
      )}
      {isSecondary && (
        <Users className="h-4 w-4 mr-2 text-muted-foreground opacity-0" />
      )}
      <div className="flex items-center">
        <span className="text-sm">{displayName}</span>
        {guideInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="ml-1.5 text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <IdCard className="h-3 w-3 mr-1" />
                  {guideInfo.guideType}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="p-0">
                <div className="p-2">
                  <div className="mb-1 font-medium">{guideInfo.name}</div>
                  <div className="text-xs flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>Born: {format(guideInfo.birthday, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="text-xs mt-1">
                    {guideInfo.guideType === 'GA Ticket' && 'Needs adult ticket for Versailles'}
                    {guideInfo.guideType === 'GA Free' && 'Needs child ticket for Versailles'}
                    {guideInfo.guideType === 'GC' && 'Can guide inside, no ticket needed'}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
