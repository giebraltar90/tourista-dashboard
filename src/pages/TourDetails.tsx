
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useGuideInfo } from "@/hooks/guides";
import { useMemo } from "react";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("TourDetails rendering with ID:", tourId);
  
  const {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  } = useTourDetailsData(tourId);
  
  // Use useMemo for guide info hooks to maintain consistent references
  // and prevent unnecessary rerenders
  const guide1Info = useMemo(() => {
    return tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  }, [tour?.guide1]);
  
  const guide2Info = useMemo(() => {
    return tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  }, [tour?.guide2]);
  
  const guide3Info = useMemo(() => {
    return tour?.guide3 ? useGuideInfo(tour.guide3) : null;
  }, [tour?.guide3]);
  
  console.log("Tour data loaded:", tour);

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

export default TourDetails;
