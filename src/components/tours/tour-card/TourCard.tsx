
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
  referenceCode,
  numTickets,
  isCondensed = false
}: TourCardProps) => {
  // Calculate total group size
  const totalSize = tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  // Calculate total capacity based on guide presence
  const maxCapacity = guide2 ? 30 : 15;
  
  // Calculate capacity percentage
  const capacityPercentage = Math.min(Math.round((totalSize / maxCapacity) * 100), 100);
  
  // Determine if tour is at or over capacity
  const isAtCapacity = capacityPercentage >= 100;
  const isNearCapacity = capacityPercentage >= 80 && capacityPercentage < 100;
  
  return (
    <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isCondensed ? 'h-full' : ''}`}>
      <Link to={`/tours/${id}`} className="flex flex-col h-full">
        <TourCardHeader 
          tourName={tourName} 
          date={date} 
          startTime={startTime} 
          location={location}
          referenceCode={referenceCode}
        />
        
        <div className="flex-1 px-4 py-3 space-y-3">
          <TourCardCapacity 
            capacityPercentage={capacityPercentage}
            isAtCapacity={isAtCapacity}
            isNearCapacity={isNearCapacity}
            totalSize={totalSize}
            maxCapacity={maxCapacity}
          />
          
          <TourCardDetails 
            date={date}
            startTime={startTime}
            location={location}
            referenceCode={referenceCode}
            numTickets={numTickets}
            totalSize={totalSize}
            isCondensed={isCondensed}
          />
        </div>
        
        <div className="px-4 pb-3 space-y-3">
          <TourCardGuide 
            guide1={guide1}
            guide2={guide2}
            isCondensed={isCondensed}
          />
        </div>
        
        <TourCardFooter 
          isCondensed={isCondensed}
          tourId={id}
          referenceCode={referenceCode}
        />
      </Link>
    </div>
  );
};
