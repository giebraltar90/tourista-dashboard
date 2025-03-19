
import React from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { TourHeader } from "./TourHeader";
import { TourTabs } from "./TourTabs";

interface NormalizedTourContentProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const NormalizedTourContent: React.FC<NormalizedTourContentProps> = ({ 
  tour, 
  tourId,
  guide1Info, 
  guide2Info, 
  guide3Info,
  activeTab,
  onTabChange
}) => {
  // Normalize tour data to ensure all properties exist with proper defaults
  const normalizedTour = {
    ...tour,
    id: tour.id || tourId,
    date: tour.date instanceof Date ? tour.date : new Date(),
    location: tour.location || "",
    tourName: tour.tourName || "",
    tourType: tour.tourType || "default",
    startTime: tour.startTime || "",
    referenceCode: tour.referenceCode || "",
    guide1: tour.guide1 || "",
    guide2: tour.guide2 || "",
    guide3: tour.guide3 || "",
    tourGroups: Array.isArray(tour.tourGroups) ? tour.tourGroups.map(group => ({
      id: group.id || "",
      name: group.name || "",
      size: group.size || 0,
      entryTime: group.entryTime || "",
      guideId: group.guideId,
      childCount: group.childCount || 0,
      participants: Array.isArray(group.participants) ? group.participants : []
    })) : [],
    numTickets: tour.numTickets || 0,
    isHighSeason: Boolean(tour.isHighSeason),
    modifications: Array.isArray(tour.modifications) ? tour.modifications : []
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <TourHeader 
        tour={normalizedTour} 
        guide1Info={guide1Info} 
        guide2Info={guide2Info} 
        guide3Info={guide3Info} 
      />
      
      <TourTabs
        tour={normalizedTour}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};
