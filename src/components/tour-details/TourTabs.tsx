
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
  const previousTabRef = useRef<string>(activeTab);
  const initialRenderRef = useRef(true);
  
  // Force refresh when switching tabs to ensure consistent data
  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      // Only refresh when actually changing tabs
      console.log(`Tab changed from ${previousTabRef.current} to ${activeTab} - refreshing data`);
      
      // Force fetch fresh data when tab changes
      if (tour && tour.id) {
        queryClient.invalidateQueries({ queryKey: ['tour', tour.id] });
      }
      
      // Update the ref
      previousTabRef.current = activeTab;
    }
  }, [activeTab, tour?.id, queryClient]);
  
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

  // Critical: Update the query cache when the component mounts or tour data changes
  // But avoid the infinite loop by using a ref to track initial render
  useEffect(() => {
    if (!tour || !tour.id) return;
    
    // Only run this effect on mount, not on every render
    if (initialRenderRef.current) {
      const cachedTour = queryClient.getQueryData(['tour', tour.id]) as TourCardProps | undefined;
      
      // Only update if there's no cached data or if the tour data is newer
      if (!cachedTour || new Date(cachedTour.date) <= new Date(tour.date)) {
        console.log("Initial update to query cache with latest tour data");
        queryClient.setQueryData(['tour', tour.id], tour);
      }
      
      initialRenderRef.current = false;
    }
  }, [tour, queryClient]);

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-6">
        <TourOverview 
          tour={tour} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="tickets" className="space-y-4 mt-6">
        <TicketsManagement 
          tour={tour} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="modifications" className="space-y-4 mt-6">
        <ModificationsTab 
          key={`modifications-${activeTab === "modifications" ? Date.now() : "inactive"}`} 
          tour={tour} 
        />
      </TabsContent>
    </Tabs>
  );
};
