
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useTourDatabaseCheck } from "./hooks/useTourDatabaseCheck";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { useParticipantRefreshEvents } from "./hooks/useParticipantRefreshEvents";
import { useEffect } from "react";

/**
 * Main tour details page component - refactored for cleaner organization
 */
const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("🚀 [TourDetailsPage] Rendering with ID:", tourId);
  
  // Extract hooks functionality for better organization
  useTourDatabaseCheck(tourId);
  
  const {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  } = useTourDetailsData(tourId);
  
  // Debug tour data
  useEffect(() => {
    if (tour) {
      console.log("🚀 [TourDetailsPage] Tour data loaded:", {
        id: tour.id,
        guide1: tour.guide1 || 'none',
        guide2: tour.guide2 || 'none',
        guide3: tour.guide3 || 'none',
        groupCount: tour.tourGroups?.length || 0,
        location: tour.location
      });
    } else if (error) {
      console.error("🚀 [TourDetailsPage] Error loading tour:", error);
    } else if (isLoading) {
      console.log("🚀 [TourDetailsPage] Loading tour data...");
    } else {
      console.log("🚀 [TourDetailsPage] No tour data available yet");
    }
  }, [tour, error, isLoading]);
  
  // Custom hook for guide information - safely pass tour
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  
  // Listen for refresh-participants event
  useParticipantRefreshEvents(tourId, handleRefetch);

  // Early return if we have an error that's not just "no tour data"
  if (error && !isLoading) {
    console.error("🚀 [TourDetailsPage] Error rendering tour:", error);
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

export default TourDetailsPage;
