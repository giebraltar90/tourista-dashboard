
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TourOverview } from "./tour-overview/TourOverview";
import { GroupsManagement } from "./groups-management/GroupsManagement";
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

interface NormalizedTourContentProps {
  tour: TourCardProps;
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  // Log when component renders with tour data
  useEffect(() => {
    logger.debug("NormalizedTourContent rendered with tour:", {
      tourId,
      tourName: tour.tourName,
      date: tour.date,
      location: tour.location
    });
  }, [tour, tourId]);

  // Handle tab changes safely
  const handleTabChange = (value: string) => {
    try {
      onTabChange(value);
    } catch (error) {
      logger.error("Error changing tab:", error);
      toast.error("An error occurred while changing tabs");
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 w-full rounded-b-none">
            <TabsTrigger value="overview">Tour Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups & Participants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6">
            <TourOverview 
              tour={tour} 
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
            />
          </TabsContent>
          
          <TabsContent value="groups" className="p-6">
            <GroupsManagement 
              tour={tour} 
              tourId={tourId}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
