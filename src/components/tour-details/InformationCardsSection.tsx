
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
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Tour Overview</h3>
      <InfoCardsGrid 
        tour={tour}
        isHighSeason={isHighSeason}
        adultTickets={participantCounts.adultTickets}
        childTickets={participantCounts.childTickets}
        totalTickets={participantCounts.totalTickets}
        requiredTickets={participantCounts.totalTicketsNeeded}
        location={tour.location}
      />
    </div>
  );
};
