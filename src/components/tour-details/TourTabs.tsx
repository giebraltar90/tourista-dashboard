
import React, { useRef, useEffect, useState } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TourOverview } from "@/components/tour-details/TourOverview";
import { TicketsManagement } from "@/components/tour-details/ticket-management";
import { ModificationsTab } from "@/components/tour-details/ModificationsTab";
import { useQueryClient } from "@tanstack/react-query";

interface TourTabsProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TourTabs: React.FC<TourTabsProps> = ({
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  activeTab,
  onTabChange
}) => {
  const queryClient = useQueryClient();
  
  // Use React Query cache for the single source of truth
  // This ensures guide changes persist between tab switches
  const getCurrentTourData = () => {
    // Always try to get the latest data from the cache
    const cachedTour = queryClient.getQueryData(['tour', tour.id]);
    return cachedTour || tour;
  };
  
  // Log when tour data changes for debugging
  useEffect(() => {
    console.log("TourTabs received updated tour data:", {
      tourId: tour.id,
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3,
      groupCount: tour.tourGroups?.length,
      groupGuides: tour.tourGroups?.map(g => ({ 
        name: g.name, 
        guideId: g.guideId 
      }))
    });
  }, [tour]);
  
  // Log when tab changes for debugging
  useEffect(() => {
    console.log("Tab changed to:", activeTab);
  }, [activeTab]);

  // Critical: Force update the query cache when the component mounts
  // This ensures we have the latest data when switching tabs
  useEffect(() => {
    if (tour && tour.id) {
      queryClient.setQueryData(['tour', tour.id], tour);
    }
  }, []);

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-6">
        <TourOverview 
          tour={getCurrentTourData() as TourCardProps} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="tickets" className="space-y-4 mt-6">
        <TicketsManagement 
          tour={getCurrentTourData() as TourCardProps} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="modifications" className="space-y-4 mt-6">
        <ModificationsTab 
          key={`modifications-${activeTab === "modifications" ? Date.now() : "inactive"}`} 
          tour={getCurrentTourData() as TourCardProps} 
        />
      </TabsContent>
    </Tabs>
  );
};
