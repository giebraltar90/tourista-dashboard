
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourGroupsSection } from "./overview/TourGroupsSection";
import { InformationCardsSection } from "./overview/InformationCardsSection";
import { GroupsManagement } from "./groups-management";
import { GuideInfo } from "@/types/ventrata";
import { ParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";

interface TourOverviewProps {
  tour: TourCardProps;
  participantCounts: ParticipantCounts;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourOverview = ({ 
  tour,
  participantCounts, 
  guide1Info,
  guide2Info,
  guide3Info
}: TourOverviewProps) => {
  // Check if this is high season (example logic)
  const isHighSeason = tour?.isHighSeason || false;
  
  // Safely access tourGroups with a fallback
  const tourGroups = tour?.tourGroups || [];

  // Guard against undefined tour
  if (!tour) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <p className="text-muted-foreground">Cannot display tour overview. Tour data is missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
      
      {/* Add GroupsManagement directly in the overview */}
      <GroupsManagement 
        tour={tour}
        tourId={tour.id}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
    </div>
  );
};
