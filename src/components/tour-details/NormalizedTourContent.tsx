
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourHeader } from "./TourHeader";
import { TourTabs } from "./TourTabs";
import { TourOverview } from "./TourOverview";
import { TicketsManagement } from "./ticket-management";
import { GroupsManagement } from "./groups-management";
import { ModificationsTab } from "./ModificationsTab";
import { GuideInfo } from "@/types/ventrata";
import { useParticipantCounts } from "@/hooks/tour-details/useParticipantCounts";

export interface NormalizedTourContentProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const NormalizedTourContent = ({
  tour,
  tourId,
  guide1Info,
  guide2Info,
  guide3Info,
  activeTab = "overview",
  onTabChange,
}: NormalizedTourContentProps) => {
  const participantCounts = useParticipantCounts(tour.tourGroups);
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <TourHeader 
        tourName={tour.tourName} 
        date={tour.date} 
        startTime={tour.startTime}
        location={tour.location}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      <TourTabs 
        activeTab={activeTab} 
        onTabChange={onTabChange || (() => {})}
      />
      
      <div className="space-y-8">
        {activeTab === "overview" && (
          <TourOverview 
            tour={tour} 
            participantCounts={participantCounts}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        )}
        
        {activeTab === "tickets" && (
          <TicketsManagement 
            tour={tour} 
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        )}
        
        {activeTab === "groups" && (
          <GroupsManagement 
            tour={tour}
            tourId={tourId}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        )}
        
        {activeTab === "modifications" && (
          <ModificationsTab 
            tour={tour}
            tourId={tourId}
          />
        )}
      </div>
    </div>
  );
};
