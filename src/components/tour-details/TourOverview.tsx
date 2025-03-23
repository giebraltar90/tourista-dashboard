
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { TourGroupsSection } from "./overview";
import { Separator } from "@/components/ui/separator";
import { GroupAssignment } from "./groups-management/group-assignment";
import { useQueryClient } from "@tanstack/react-query";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { useEffect } from "react";
import { useParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";
import { InformationCardsSection } from "./overview/InformationCardsSection";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  const queryClient = useQueryClient();
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  
  const { localTourGroups, refreshParticipants } = useGroupManagement(tour);
  
  // Refresh participants when tour changes
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
      refreshParticipants();
    }
  }, [tour?.id, queryClient, refreshParticipants]);
  
  // Use the actual tour groups from local state if available
  const tourGroups = Array.isArray(localTourGroups) && localTourGroups.length > 0 
    ? localTourGroups 
    : (Array.isArray(tour.tourGroups) ? tour.tourGroups : []);
  
  // Get high season flag
  const isHighSeason = Boolean(tour.isHighSeason);
  
  // Calculate participant counts using our custom hook - simplified
  const participantCounts = useParticipantCounts(
    tourGroups,
    tour.location
  );

  return (
    <div className="space-y-6">
      {/* Information Cards Section */}
      <InformationCardsSection
        tour={tour}
        tourGroups={tourGroups}
        participantCounts={participantCounts}
        isHighSeason={isHighSeason}
      />
      
      <Separator className="my-6" />
      
      {/* Tour Groups Section */}
      <TourGroupsSection
        tour={tour}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      <Separator className="my-6" />
      
      {/* Group Assignment */}
      <GroupAssignment
        tour={{...tour, isHighSeason}}
      />
    </div>
  );
};
