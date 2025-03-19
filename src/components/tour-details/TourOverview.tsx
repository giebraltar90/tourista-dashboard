
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { 
  TourInformationCard,
  ParticipantsCard,
  TicketsCard,
  TourGroupsSection
} from "./overview";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  // CRITICAL FIX: Explicitly convert to boolean and ensure consistent behavior
  const isHighSeason = tour.isHighSeason === true;
  console.log('TourOverview: isHighSeason =', isHighSeason, 'original value =', tour.isHighSeason, 'type =', typeof tour.isHighSeason);
  
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TourInformationCard 
          referenceCode={tour.referenceCode} 
          tourType={tour.tourType} 
        />
        
        <ParticipantsCard 
          tourGroups={tour.tourGroups}
          totalParticipants={totalParticipants}
          isHighSeason={isHighSeason}
        />
        
        <TicketsCard
          adultTickets={adultTickets}
          childTickets={childTickets}
          totalTickets={tour.numTickets || totalParticipants}
        />
      </div>
      
      <TourGroupsSection
        tour={{...tour, isHighSeason}}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
    </div>
  );
};
