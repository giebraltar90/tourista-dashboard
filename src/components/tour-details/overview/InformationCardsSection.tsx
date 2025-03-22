
import { TourCardProps } from "@/components/tours/tour-card/types";
import { 
  TourInformationCard,
  TicketsCard,
  ParticipantsCard
} from "./";
import { VentrataTourGroup } from "@/types/ventrata";
import { ParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";

interface InformationCardsSectionProps {
  tour: TourCardProps;
  tourGroups: VentrataTourGroup[];
  participantCounts: ParticipantCounts;
  isHighSeason: boolean;
}

export const InformationCardsSection = ({ 
  tour, 
  tourGroups, 
  participantCounts,
  isHighSeason
}: InformationCardsSectionProps) => {
  const {
    totalParticipants,
    totalChildCount,
    totalTickets,
    adultTickets,
    childTickets,
    guideAdultTickets,
    guideChildTickets
  } = participantCounts;
  
  const requiredTickets = tour.numTickets || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TourInformationCard 
        referenceCode={tour.referenceCode} 
        tourType={tour.tourType} 
      />
      
      <ParticipantsCard
        tourGroups={tourGroups}
        totalParticipants={totalParticipants}
        totalChildCount={totalChildCount}
        isHighSeason={isHighSeason}
      />
      
      <TicketsCard
        adultTickets={adultTickets}
        childTickets={childTickets}
        totalTickets={totalTickets}
        requiredTickets={requiredTickets > 0 ? requiredTickets : totalParticipants}
        guideAdultTickets={guideAdultTickets}
        guideChildTickets={guideChildTickets}
        location={tour.location}
      />
    </div>
  );
}
