
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
  // Use state to store the most current version of tour data per tab
  // This prevents data loss when switching between tabs
  const [tabSpecificTourData, setTabSpecificTourData] = useState<{[key: string]: any}>({
    overview: tour,
    tickets: tour,
    modifications: tour
  });
  
  // When the tour data changes, update all tab data
  useEffect(() => {
    if (tour) {
      // Don't update the active tab's data directly from incoming tour
      // as it might overwrite user changes
      setTabSpecificTourData(prevData => {
        const newData = { ...prevData };
        
        // Update data for inactive tabs only
        Object.keys(newData).forEach(tabKey => {
          if (tabKey !== activeTab) {
            newData[tabKey] = JSON.parse(JSON.stringify(tour));
          }
        });
        
        return newData;
      });
    }
  }, [tour, activeTab]);
  
  // When leaving a tab, store its data version
  const handleTabChange = (newTab: string) => {
    if (activeTab !== newTab) {
      // Preserve the current tab's version of the data before switching
      setTabSpecificTourData(prevData => ({
        ...prevData,
        [activeTab]: JSON.parse(JSON.stringify(tabSpecificTourData[activeTab] || tour))
      }));
    }
    onTabChange(newTab);
  };
  
  // Get the appropriate tour data based on current tab
  const getTabTourData = (tabName: string) => {
    return tabSpecificTourData[tabName] || tour;
  };

  // Log when tab changes for debugging
  useEffect(() => {
    console.log("Tab changed to:", activeTab);
  }, [activeTab]);

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-6">
        <TourOverview 
          tour={getTabTourData("overview")} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="tickets" className="space-y-4 mt-6">
        <TicketsManagement 
          tour={getTabTourData("tickets")} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="modifications" className="space-y-4 mt-6">
        <ModificationsTab 
          key={`modifications-${activeTab === "modifications" ? Date.now() : "inactive"}`} 
          tour={getTabTourData("modifications")} 
        />
      </TabsContent>
    </Tabs>
  );
};
