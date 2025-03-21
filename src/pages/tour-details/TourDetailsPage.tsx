
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useTourDatabaseCheck } from "./hooks/useTourDatabaseCheck";
import { useTourGuideInfo } from "./hooks/useTourGuideInfo";
import { useParticipantRefreshEvents } from "./hooks/useParticipantRefreshEvents";

/**
 * Main tour details page component - refactored for cleaner organization
 */
const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("DATABASE DEBUG: TourDetails rendering with ID:", tourId);
  
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
  
  // Custom hook for guide information
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  
  // Listen for refresh-participants event
  useParticipantRefreshEvents(tourId, handleRefetch);

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingState />
      ) : error || !tour ? (
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
