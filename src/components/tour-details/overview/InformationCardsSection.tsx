
import { TourCardProps } from "@/components/tours/tour-card/types";
import { 
  TourInformationCard,
  TicketsCard,
  ParticipantsCard
} from "./";
import { VentrataTourGroup } from "@/types/ventrata";
import { ParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";
import { GuideInfo } from "@/types/ventrata";
import { useEffect } from "react";

interface InformationCardsSectionProps {
  tour: TourCardProps;
  tourGroups: VentrataTourGroup[];
  participantCounts: ParticipantCounts;
  isHighSeason: boolean;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const InformationCardsSection = ({ 
  tour, 
  tourGroups, 
  participantCounts,
  isHighSeason,
  guide1Info = null,
  guide2Info = null,
  guide3Info = null
}: InformationCardsSectionProps) => {
  const {
    totalParticipants,
    totalChildCount,
    totalTickets,
    adultTickets,
    childTickets
  } = participantCounts;
  
  const requiredTickets = tour.numTickets || 0;
  
  // Debug log to track changes in participants and guides
  useEffect(() => {
    console.log("InformationCardsSection: Re-rendering with updated data", {
      totalParticipants,
      adultTickets,
      childTickets,
      totalTickets,
      requiredTickets,
      guide1: guide1Info?.name || 'None',
      guide2: guide2Info?.name || 'None',
      guide3: guide3Info?.name || 'None'
    });
  }, [
    totalParticipants, 
    adultTickets, 
    childTickets, 
    totalTickets, 
    requiredTickets,
    guide1Info,
    guide2Info,
    guide3Info
  ]);

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
        location={tour.location}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
        tourGroups={tourGroups}
        tourId={tour.id}
      />
    </div>
  );
}
