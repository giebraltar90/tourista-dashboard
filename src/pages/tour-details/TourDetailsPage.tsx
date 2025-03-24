
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useTourDatabaseCheck } from "./hooks/useTourDatabaseCheck";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { useParticipantRefreshEvents } from "./hooks/useParticipantRefreshEvents";
import { useEffect, useCallback, useState } from "react";
import { useSyncTourGroupGuides } from "@/hooks/group-management/useSyncTourGroupGuides";
import { logger } from "@/utils/logger";

/**
 * Main tour details page component - refactored for cleaner organization
 */
const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [lastGuideChangeTime, setLastGuideChangeTime] = useState(0);
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("🚀 [TourDetailsPage] Rendering with ID:", tourId);
  
  // Extract hooks functionality for better organization
  useTourDatabaseCheck(tourId);
  
  // Add the guide sync hook to ensure database consistency
  useSyncTourGroupGuides(tourId);
  
  const {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  } = useTourDetailsData(tourId);
  
  // Debug tour data - using useCallback to prevent recreation on each render
  const logTourData = useCallback(() => {
    if (tour) {
      logger.debug("🚀 [TourDetailsPage] Tour data loaded:", {
        id: tour.id,
        guide1: tour.guide1 || 'none',
        guide2: tour.guide2 || 'none',
        guide3: tour.guide3 || 'none',
        groupCount: tour.tourGroups?.length || 0,
        location: tour.location
      });
    } else if (error) {
      logger.error("🚀 [TourDetailsPage] Error loading tour:", error);
    } else if (isLoading) {
      logger.debug("🚀 [TourDetailsPage] Loading tour data...");
    } else {
      logger.debug("🚀 [TourDetailsPage] No tour data available yet");
    }
  }, [tour, error, isLoading]);
  
  // Log tour data only when dependencies change
  useEffect(() => {
    logTourData();
  }, [logTourData]);
  
  // Custom hook for guide information - safely pass tour
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  
  // Listen for refresh-participants event
  useParticipantRefreshEvents(tourId, handleRefetch);

  // Listen for guide change events to force a full refetch
  useEffect(() => {
    const handleGuideChange = () => {
      logger.debug("🔄 [TourDetailsPage] Guide change event detected, scheduling refetch");
      
      // Set a timestamp to prevent duplicate events
      const now = Date.now();
      if (now - lastGuideChangeTime > 500) {
        setLastGuideChangeTime(now);
        
        // Force a refetch after a slight delay to ensure DB changes are complete
        setTimeout(() => {
          logger.debug("🔄 [TourDetailsPage] Executing scheduled refetch after guide change");
          handleRefetch();
        }, 800);
      }
    };
    
    // Register for both guide change events
    window.addEventListener(`guide-change:${tourId}`, handleGuideChange);
    window.addEventListener(`guide-assignment-updated:${tourId}`, handleGuideChange);
    
    return () => {
      window.removeEventListener(`guide-change:${tourId}`, handleGuideChange);
      window.removeEventListener(`guide-assignment-updated:${tourId}`, handleGuideChange);
    };
  }, [tourId, handleRefetch, lastGuideChangeTime]);

  // Early return if we have an error that's not just "no tour data"
  if (error && !isLoading) {
    logger.error("🚀 [TourDetailsPage] Error rendering tour:", error);
    return (
      <DashboardLayout>
        <ErrorState tourId={tourId} onRetry={handleRefetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingState />
      ) : !tour ? (
        <ErrorState tourId={tourId} onRetry={handleRefetch} />
      ) : (
        <NormalizedTourContent
          tour={tour}
          tourId={tourId}
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          guide3Info={guide3Info}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </DashboardLayout>
  );
};

// Export as default without using memo to avoid potential issues
export default TourDetailsPage;
