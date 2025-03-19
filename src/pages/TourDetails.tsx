
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
import { useState, useEffect, useRef } from "react";
import { useTourById } from "@/hooks/useTourData";
import { TourHeader } from "@/components/tour-details/TourHeader";
import { TourOverview } from "@/components/tour-details/TourOverview";
import { GroupsManagement, GroupGuideManagement } from "@/components/tour-details/groups-management";
import { TicketsManagement } from "@/components/tour-details/ticket-management";
import { ModificationsTab } from "@/components/tour-details/ModificationsTab";
import { useGuideInfo } from "@/hooks/useGuideData";
import { useQueryClient } from "@tanstack/react-query";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastRefetchTime = useRef(Date.now());
  
  console.log("TourDetails rendering with ID:", id);
  
  const { data: tour, isLoading, error, refetch } = useTourById(id || "");
  
  console.log("Tour data loaded:", tour);
  
  // Only attempt to get guide info if tour data has loaded
  const guide1Info = tour && tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour && tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour && tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
  useEffect(() => {
    if (id && isInitialLoad.current) {
      console.log("Initial load, invalidating queries for tour:", id);
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      refetch();
      isInitialLoad.current = false;
    }
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [id, queryClient, refetch]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const now = Date.now();
    if (id && (now - lastRefetchTime.current) > 30000) { 
      console.log("Tab changed, refreshing data after long timeout");
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      refetch();
      lastRefetchTime.current = now;
    }
  };
  
  useEffect(() => {
    if (!id) return;
    
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    
    refreshTimer.current = setInterval(() => {
      const now = Date.now();
      if ((now - lastRefetchTime.current) > 120000) {
        console.log("Periodic refresh triggered after long inactivity");
        refetch();
        lastRefetchTime.current = now;
      }
    }, 300000);
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [id, refetch]);
  
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
    console.error("Error loading tour or tour data is null:", error);
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tour details (ID: {id}). Please try again.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <TourHeader tour={tour} guide1Info={guide1Info} guide2Info={guide2Info} guide3Info={guide3Info} />
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full">
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
              <GroupGuideManagement key={`guide-management-${tour.id}-${activeTab}`} tour={tour} />
              <GroupsManagement key={`groups-management-${tour.id}-${activeTab}`} tour={tour} />
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
            <ModificationsTab key={`modifications-${tour.id}-${activeTab}`} tour={tour} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TourDetails;
