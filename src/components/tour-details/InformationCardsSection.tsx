
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { ParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";
import { InfoCardsGrid } from "./overview/InfoCardsGrid";

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
  // Use the properties that exist in the ParticipantCounts type
  const { 
    totalParticipants,
    adultCount,
    childCount,
    totalTickets,
    totalTicketsNeeded,
    adultTickets,
    childTickets
  } = participantCounts;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Tour Overview</h3>
      <InfoCardsGrid 
        tour={tour}
        isHighSeason={isHighSeason}
        adultTickets={adultTickets}
        childTickets={childTickets}
        totalTickets={totalTickets}
        requiredTickets={totalTicketsNeeded}
        location={tour.location}
      />
    </div>
  );
};
