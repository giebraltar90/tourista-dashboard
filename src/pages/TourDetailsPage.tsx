
import { useEffect, useState } from "react";
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

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  // Safeguard against undefined ID
  const tourId = id || "";
  
  // Fetch tour data with error handling
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  // Fetch guide information if available
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${tourId}:`, error);
      toast.error("Error loading tour data");
    }
  }, [error, tourId]);
  
  // When a tour is loaded, log its basic details
  useEffect(() => {
    if (tour) {
      logger.debug(`Loaded tour: ${tour.tourName}`, {
        tourId: tour.id,
        date: tour.date,
        location: tour.location,
        guide1: tour.guide1,
        guide2: tour.guide2,
        guide3: tour.guide3,
        numGroups: tour.tourGroups?.length || 0
      });
    }
  }, [tour]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error || !tour) {
    return (
      <ErrorState 
        message={error instanceof Error ? error.message : "Tour not found"} 
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default TourDetailsPage;
