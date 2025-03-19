
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { useTourById } from "@/hooks/useTourData";
import { TourHeader } from "@/components/tour-details/TourHeader";
import { TourOverview } from "@/components/tour-details/TourOverview";
import { GroupsManagement, GroupGuideManagement } from "@/components/tour-details/groups-management";
import { TicketsManagement } from "@/components/tour-details/ticket-management";
import { ModificationsTab } from "@/components/tour-details/ModificationsTab";
import { useGuideInfo } from "@/hooks/useGuideData";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: tour, isLoading, error } = useTourById(id || "");
  
  // Get guide information
  const guide1Info = tour ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !tour) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tour details. Please try again.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  // Log tour data for debugging
  console.log("Tour details:", {
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    tourGroups: tour.tourGroups
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <TourHeader tour={tour} guide1Info={guide1Info} guide2Info={guide2Info} guide3Info={guide3Info} />
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups & Guides</TabsTrigger>
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
          
          <TabsContent value="groups" className="space-y-4 mt-6">
            <div className="space-y-6">
              <GroupGuideManagement tour={tour} />
              <GroupsManagement tour={tour} />
            </div>
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
            <ModificationsTab tour={tour} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TourDetails;
