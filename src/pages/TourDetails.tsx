
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
  
  const { data: tour, isLoading, error, refetch } = useTourById(id || "");
  
  // Get guide information
  const guide1Info = tour ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
  // Force data refresh when component mounts, but only once
  useEffect(() => {
    if (id && isInitialLoad.current) {
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      refetch();
      isInitialLoad.current = false;
    }
    
    return () => {
      // Clear the timer when component unmounts
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [id, queryClient, refetch]);
  
  // Refresh data when tab changes, but with throttling to prevent flickering
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Only force refresh if it's been more than 10 seconds since last refresh
    const now = Date.now();
    if (id && (now - lastRefetchTime.current) > 10000) { 
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      refetch();
      lastRefetchTime.current = now;
    }
  };
  
  // Refresh data very infrequently to avoid flickering and respect optimistic updates
  useEffect(() => {
    if (!id) return;
    
    // Clear existing timer if any
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    
    // Set up periodic refreshes with a much longer interval (2 minutes) to avoid disrupting user experience
    refreshTimer.current = setInterval(() => {
      // Only refetch if no user interaction in the last minute
      const now = Date.now();
      if ((now - lastRefetchTime.current) > 60000) {
        refetch();
        lastRefetchTime.current = now;
      }
    }, 120000); // Refresh every 2 minutes
    
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
            <ModificationsTab tour={tour} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TourDetails;
