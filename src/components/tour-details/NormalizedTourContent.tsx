
import { TourHeader } from "./TourHeader";
import { TourTabs } from "./TourTabs";
import { TourOverview } from "./TourOverview";
import { ModificationsTab } from "./ModificationsTab";
import { TicketsManagement } from "./ticket-management";
import { useState, useEffect } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";

interface NormalizedTourContentProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const NormalizedTourContent = ({ 
  tour, 
  tourId,
  guide1Info,
  guide2Info,
  guide3Info,
  activeTab,
  onTabChange
}: NormalizedTourContentProps) => {
  console.log("NormalizedTourContent rendering with tour:", tour);
  
  // Pass tourGroups to TourTabs to show guide assignments
  const groupGuides = tour.tourGroups ? tour.tourGroups.map(group => ({
    name: group.name || "",
    guideId: group.guideId
  })) : [];
  
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-10 py-6 space-y-6">
      <TourHeader 
        tour={tour}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      <TourTabs 
        activeValue={activeTab} 
        onValueChange={onTabChange}
        tourId={tourId}
        guide1={tour.guide1 || ""}
        guide2={tour.guide2 || ""}
        guide3={tour.guide3 || ""}
        groupCount={tour.tourGroups?.length || 0}
        groupGuides={groupGuides}
      />
      
      <div className="transition-all duration-200">
        {activeTab === "overview" && (
          <TourOverview 
            tour={tour}
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
        
        {activeTab === "modifications" && (
          <ModificationsTab tour={tour} />
        )}
      </div>
    </div>
  );
};
