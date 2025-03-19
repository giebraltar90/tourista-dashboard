
import React, { useRef } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TourOverview } from "@/components/tour-details/TourOverview";
import { GroupGuideManagement, GroupsManagement } from "@/components/tour-details/groups-management";
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
  // Create stable references to prevent unnecessary re-renders
  const stableTourGroups = useRef(tour.tourGroups);
  const stableModifications = useRef(tour.modifications);
  
  // Only update if the data has actually changed
  if (JSON.stringify(stableTourGroups.current) !== JSON.stringify(tour.tourGroups)) {
    stableTourGroups.current = tour.tourGroups;
  }
  
  if (JSON.stringify(stableModifications.current) !== JSON.stringify(tour.modifications)) {
    stableModifications.current = tour.modifications;
  }
  
  // Create a stable tour reference to prevent unnecessary re-renders
  const stableTour = {
    ...tour,
    tourGroups: stableTourGroups.current,
    modifications: stableModifications.current
  };

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="groups">Groups & Guides</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="modifications">Modifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4 mt-6">
        <TourOverview 
          tour={stableTour} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="groups" className="space-y-4 mt-6">
        <div className="space-y-6">
          <GroupGuideManagement key={`guide-management-${stableTour.id}`} tour={stableTour} />
          <GroupsManagement key={`groups-management-${stableTour.id}`} tour={stableTour} />
        </div>
      </TabsContent>
      
      <TabsContent value="tickets" className="space-y-4 mt-6">
        <TicketsManagement 
          tour={stableTour} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </TabsContent>
      
      <TabsContent value="modifications" className="space-y-4 mt-6">
        <ModificationsTab key={`modifications-${stableTour.id}`} tour={stableTour} />
      </TabsContent>
    </Tabs>
  );
};
