
import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TourCardProps } from "./types";
import { TourCardHeader } from "./TourCardHeader";
import { TourCardDetails } from "./TourCardDetails";
import { TourCardFooter } from "./TourCardFooter";

export function TourCard({
  id,
  date,
  location,
  tourName,
  tourType,
  startTime,
  referenceCode,
  guide1,
  guide2,
  tourGroups,
  numTickets
}: TourCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { guideData } = require('@/hooks/useGuideData');
  const guide1Info = guideData[guide1] || null;
  const guide2Info = guideData[guide2 || ''] || null;
  
  const totalParticipants = tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  const formattedDate = format(date, 'dd MMM yyyy');
  const dayOfWeek = format(date, 'EEEE');
  
  const tourColor = 
    tourType === 'food' ? 'tour-food' : 
    tourType === 'private' ? 'tour-private' : 
    'tour-default';
    
  const isBelowMinimum = totalParticipants < 4;
  
  const isHighSeason = tourGroups.length > 2;
  
  return (
    <Card 
      className={cn(
        "tour-item overflow-hidden transition-all duration-300 border border-border/60",
        "hover:shadow-md hover:border-primary/20",
        isHovered && "shadow-md border-primary/20",
        isBelowMinimum && "border-yellow-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        <div className={cn(
          "w-20 flex flex-col items-center justify-center p-4 text-white font-medium",
          `bg-${tourColor}`,
          "transition-all duration-300",
          isHovered && "w-24"
        )}>
          <span className="text-xs font-light opacity-80">{dayOfWeek}</span>
          <span className="text-xl mt-1">{format(date, 'd')}</span>
          <span className="text-sm">{format(date, 'MMM')}</span>
        </div>
        
        <div className="flex-1">
          <TourCardHeader 
            tourName={tourName}
            location={location}
            referenceCode={referenceCode}
            startTime={startTime}
            isHovered={isHovered}
          />
          
          <TourCardDetails
            guide1={guide1}
            guide2={guide2}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            location={location}
            tourGroups={tourGroups}
            totalParticipants={totalParticipants}
            isHighSeason={isHighSeason}
          />
          
          <TourCardFooter
            id={id}
            totalParticipants={totalParticipants}
            numTickets={numTickets}
            isBelowMinimum={isBelowMinimum}
            isHighSeason={isHighSeason}
            isHovered={isHovered}
          />
        </div>
      </div>
    </Card>
  );
}
