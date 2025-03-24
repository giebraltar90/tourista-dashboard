
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourHeader } from "./TourHeader";
import { TourTabs } from "./TourTabs";
import { TourOverview } from "./TourOverview";
import { TicketsManagement } from "./ticket-management";
import { ModificationsTab } from "./ModificationsTab";
import { GuideInfo } from "@/types/ventrata";
import { memo, useMemo } from "react";

export interface NormalizedTourContentProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  ticketRequirements?: any; // Add the ticketRequirements prop
}

export const NormalizedTourContent = memo(({
  tour,
  tourId,
  guide1Info,
  guide2Info,
  guide3Info,
  activeTab = "overview",
  onTabChange,
  ticketRequirements,
}: NormalizedTourContentProps) => {
  // Guard against undefined tour data
  if (!tour || !tour.date) {
    console.error("Tour data is missing or incomplete", { tourId, tour });
    return (
      <div className="container mx-auto py-6">
        <div className="p-8 text-center bg-muted rounded-lg">
          <h2 className="text-xl font-medium mb-2">Error loading tour details</h2>
          <p className="text-muted-foreground">The tour data is incomplete or could not be loaded.</p>
        </div>
      </div>
    );
  }
  
  // Memoize the active content to prevent unnecessary re-renders
  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return (
          <TourOverview 
            tour={tour} 
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        );
      case "tickets":
        return (
          <TicketsManagement 
            tour={tour} 
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        );
      case "modifications":
        return (
          <ModificationsTab 
            tour={tour}
            tourId={tourId}
          />
        );
      default:
        return (
          <TourOverview 
            tour={tour} 
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        );
    }
  }, [activeTab, tour, tourId, guide1Info, guide2Info, guide3Info]);
  
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
        {activeContent}
      </div>
    </div>
  );
});

NormalizedTourContent.displayName = "NormalizedTourContent";
