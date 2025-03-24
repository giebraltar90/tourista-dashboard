
import { useState } from "react";
import { Link } from "react-router-dom";
import { TourCardProps } from "./types";
import { TourCardHeader } from "./TourCardHeader";
import { TourCardDetails } from "./TourCardDetails";
import { TourCardCapacity } from "./TourCardCapacity";
import { TourCardGuide } from "./TourCardGuide";
import { TourCardFooter } from "./TourCardFooter";

export const TourCard = ({ 
  id,
  tourName,
  date,
  startTime,
  tourGroups,
  location,
  guide1,
  guide2,
  guide3,
  referenceCode,
  numTickets,
  isCondensed = false
}: TourCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate total group size
  const totalSize = tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  // Calculate total child count across all groups
  const childCount = tourGroups.reduce((sum, group) => sum + (group.childCount || 0), 0);
  
  // Determine if high season (example logic - modify as needed)
  const isHighSeason = date.getMonth() >= 5 && date.getMonth() <= 8; // June-September
  
  // Determine if below minimum (example logic - modify as needed)
  const isBelowMinimum = totalSize < 5;
  
  // Calculate capacity based on season
  const capacity = isHighSeason ? 36 : 24;
  
  // Mock guide info for now (would come from API in real implementation)
  const guide1Info = guide1 ? { 
    name: guide1, 
    birthday: new Date("1985-01-01"), 
    guideType: "GC" as const 
  } : undefined;
  
  const guide2Info = guide2 ? { 
    name: guide2, 
    birthday: new Date("1990-01-01"), 
    guideType: "GA Ticket" as const 
  } : undefined;
  
  return (
    <div 
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isCondensed ? 'h-full' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/tours/${id}`} className="flex flex-col h-full">
        <TourCardHeader 
          tourName={tourName}
          location={location}
          referenceCode={referenceCode}
          startTime={startTime}
          date={date}
          isHovered={isHovered}
        />
        
        <TourCardDetails
          guide1={guide1}
          guide2={guide2}
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          location={location}
          tourGroups={tourGroups}
          totalParticipants={totalSize}
          isHighSeason={isHighSeason}
        />
        
        <TourCardFooter
          id={id}
          totalParticipants={totalSize}
          numTickets={numTickets}
          isBelowMinimum={isBelowMinimum}
          isHighSeason={isHighSeason}
          isHovered={isHovered}
          childCount={childCount}
        />
      </Link>
    </div>
  );
};
