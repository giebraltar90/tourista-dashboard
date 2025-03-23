
import { Card, CardContent } from "@/components/ui/card";
import { ParticipantsCard } from "./ParticipantsCard";
import { TicketsCard } from "./TicketsCard";
import { TourInformationCard } from "./TourInformationCard";
import { TourCardProps } from "@/components/tours/tour-card/types";

interface InfoCardsGridProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets: number;
  location?: string;
}

export const InfoCardsGrid = ({ 
  tour,
  isHighSeason,
  adultTickets,
  childTickets,
  totalTickets,
  requiredTickets,
  location
}: InfoCardsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TourInformationCard 
        referenceCode={tour.referenceCode} 
        tourType={tour.tourType} 
      />
      
      <ParticipantsCard
        tourGroups={tour.tourGroups || []}
        totalParticipants={totalTickets}
        totalChildCount={childTickets}
        isHighSeason={isHighSeason}
      />
      
      <TicketsCard
        adultTickets={adultTickets}
        childTickets={childTickets}
        totalTickets={totalTickets}
        requiredTickets={requiredTickets}
        location={location}
      />
    </div>
  );
};
