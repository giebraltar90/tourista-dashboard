
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourCardFooterProps } from "./types";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

export const TourCardFooter: React.FC<TourCardFooterProps> = ({
  id,
  totalParticipants,
  numTickets,
  isBelowMinimum,
  isHighSeason,
  isHovered,
  childCount = 0
}) => {
  // Format the participant count as "adults+children" when applicable
  const formattedParticipantCount = formatParticipantCount(totalParticipants, childCount);

  return (
    <CardFooter className="px-4 py-3 border-t border-border/60 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {isBelowMinimum && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Below Minimum
          </Badge>
        )}
        
        {isHighSeason && (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            High Season
          </Badge>
        )}
      </div>
      
      <Link to={`/tours/${id}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "transition-all duration-300",
            isHovered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
          )}
        >
          Details
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </CardFooter>
  );
};
