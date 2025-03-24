
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourGroupsSection } from "./overview/TourGroupsSection";
import { GuideInfo } from "@/types/ventrata";
import { TourDetailsCard } from "./overview/TourDetailsCard";
import { InformationCardsSection } from "./overview/InformationCardsSection";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
}: TourOverviewProps) => {
  // Calculate if it's high season
  const isHighSeason = tour.isHighSeason || false;
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];

  // Get participant counts
  const totalParticipants = tourGroups.reduce((sum, group) => sum + (group.size || 0), 0);
  const totalChildCount = tourGroups.reduce((sum, group) => sum + (group.childCount || 0), 0);
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  const totalTickets = totalParticipants;

  const participantCounts = {
    totalParticipants,
    totalChildCount,
    adultTickets,
    childTickets,
    totalTickets,
    // Add the missing properties to fix TypeScript errors
    adultCount: adultTickets,
    childCount: totalChildCount,
    totalTicketsNeeded: totalParticipants
  };

  return (
    <div className="space-y-6">
      {/* Add the new TourDetailsCard at the top */}
      <TourDetailsCard tour={tour} />
      
      <InformationCardsSection 
        tour={tour}
        tourGroups={tourGroups}
        participantCounts={participantCounts}
        isHighSeason={isHighSeason}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />

      <TourGroupsSection 
        tour={tour}
        isHighSeason={isHighSeason}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
    </div>
  );
};
