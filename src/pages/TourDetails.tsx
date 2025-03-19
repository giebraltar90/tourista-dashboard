
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
import { useState, useEffect, useRef, useCallback } from "react";
import { useTourById } from "@/hooks/useTourData";
import { TourHeader } from "@/components/tour-details/TourHeader";
import { TourOverview } from "@/components/tour-details/TourOverview";
import { GroupGuideManagement, GroupsManagement } from "@/components/tour-details/groups-management";
import { TicketsManagement } from "@/components/tour-details/ticket-management";
import { ModificationsTab } from "@/components/tour-details/ModificationsTab";
import { useGuideInfo } from "@/hooks/guides";
import { useQueryClient } from "@tanstack/react-query";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  const lastRefetchTime = useRef(Date.now());
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("TourDetails rendering with ID:", tourId);
  
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  console.log("Tour data loaded:", tour);
  
  // Ensure that guide info hooks are only called when tour data is available and guide fields exist
  const guide1Info = tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  
  const handleRefetch = useCallback(() => {
    if (tourId) {
      console.log("Manually refreshing tour data");
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      refetch();
      lastRefetchTime.current = Date.now();
    }
  }, [tourId, queryClient, refetch]);
  
  // Initial load effect
  useEffect(() => {
    if (tourId && isInitialLoad.current) {
      console.log("Initial load, invalidating queries for tour:", tourId);
      handleRefetch();
      isInitialLoad.current = false;
    }
    
    // Cleanup function
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [tourId, handleRefetch]);
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    const now = Date.now();
    if (now - lastRefetchTime.current > 30000) { 
      console.log("Tab changed, refreshing data after long timeout");
      handleRefetch();
    }
  }, [handleRefetch]);
  
  // Set up the periodic refresh timer
  useEffect(() => {
    if (!tourId) return;
    
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
    }
    
    refreshTimer.current = setInterval(() => {
      const now = Date.now();
      if (now - lastRefetchTime.current > 120000) {
        console.log("Periodic refresh triggered after long inactivity");
        handleRefetch();
      }
    }, 300000); // 5 minutes
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [tourId, handleRefetch]);
  
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
            Failed to load tour details (ID: {tourId}). Please try again.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Normalize tour data to ensure all properties exist
  const normalizedTour = {
    ...tour,
    tourGroups: Array.isArray(tour.tourGroups) ? tour.tourGroups.map(group => ({
      ...group,
      participants: Array.isArray(group.participants) ? group.participants : []
    })) : [],
    modifications: Array.isArray(tour.modifications) ? tour.modifications : []
  };
  
  // Important: Ensure isHighSeason is a boolean
  normalizedTour.isHighSeason = Boolean(normalizedTour.isHighSeason);
  
  // CRITICAL FIX: Stable reference to ensure components don't re-render unnecessarily
  const stableTourGroups = useRef(normalizedTour.tourGroups);
  const stableModifications = useRef(normalizedTour.modifications);
  
  // Only update if the data has actually changed
  if (JSON.stringify(stableTourGroups.current) !== JSON.stringify(normalizedTour.tourGroups)) {
    stableTourGroups.current = normalizedTour.tourGroups;
  }
  
  if (JSON.stringify(stableModifications.current) !== JSON.stringify(normalizedTour.modifications)) {
    stableModifications.current = normalizedTour.modifications;
  }
  
  // Create a stable tour reference to prevent unnecessary re-renders
  const stableTour = {
    ...normalizedTour,
    tourGroups: stableTourGroups.current,
    modifications: stableModifications.current
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <TourHeader 
          tour={stableTour} 
          guide1Info={guide1Info} 
          guide2Info={guide2Info} 
          guide3Info={guide3Info} 
        />
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full">
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
              <GroupGuideManagement key={`guide-management-${normalizedTour.id}`} tour={stableTour} />
              <GroupsManagement key={`groups-management-${normalizedTour.id}`} tour={stableTour} />
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
            <ModificationsTab key={`modifications-${normalizedTour.id}`} tour={stableTour} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TourDetails;
