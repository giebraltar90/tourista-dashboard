
import { useParams, useNavigate } from "react-router-dom";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { useTourById } from "@/hooks/useTourData";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Safeguard against undefined ID
  const tourId = id || "";
  
  // Fetch tour data with error handling
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  // Fetch guide information if available
  const { guide1Info, guide2Info, guide3Info, isLoading: guidesLoading } = useTourGuideInfo(tour);

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${tourId}:`, error);
      toast.error("Error loading tour data");
    }
  }, [error, tourId]);
  
  // Log when the tour is successfully loaded
  useEffect(() => {
    if (tour) {
      logger.debug(`Loaded tour: ${tour.tourName}`, {
        tourId: tour.id,
        date: tour.date,
        location: tour.location,
      });
    }
  }, [tour]);
  
  if (isLoading || guidesLoading) {
    return <LoadingState />;
  }
  
  if (error || !tour) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unable to load tour. Please try again later.";
      
    return (
      <ErrorState 
        message={errorMessage} 
        tourId={tourId} 
        onRetry={() => refetch()} 
      />
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Back button */}
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/tours")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tour Overview
        </Button>
      </div>
      
      <NormalizedTourContent
        tour={tour}
        tourId={tourId}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
        activeTab="overview"
        onTabChange={(tab) => logger.debug(`Tab changed to ${tab}`)}
      />
    </div>
  );
};

export default TourDetailsPage;
