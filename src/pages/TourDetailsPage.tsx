
import { useParams } from "react-router-dom";
import { useTourById } from "@/hooks/tourData/useTourById";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { useState } from "react";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";

export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Safeguard against undefined ID
  const tourId = id || "";
  
  // Fetch tour data with error handling
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  // Fetch guide information if available
  const { guide1Info, guide2Info, guide3Info } = useGuideInfo(tour);
  
  // Handle loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Handle error state
  if (error || !tour) {
    return (
      <ErrorState 
        error={error} 
        tourId={tourId} 
        onRetry={() => refetch()} 
      />
    );
  }
  
  // Render the tour content
  return (
    <NormalizedTourContent
      tour={tour}
      tourId={tourId}
      guide1Info={guide1Info}
      guide2Info={guide2Info}
      guide3Info={guide3Info}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
