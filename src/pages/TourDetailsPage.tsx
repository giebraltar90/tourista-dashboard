import { useParams, useNavigate } from "react-router-dom";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { useTourById } from "@/hooks/useTourData";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { mockTours } from "@/data/mockData";
import { ArrowLeft } from "lucide-react";

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const tourId = id || "";
  
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  const { guide1Info, guide2Info, guide3Info, isLoading: guidesLoading } = useTourGuideInfo(tour);

  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${tourId}:`, error);
      toast.error("Error loading tour data", {
        description: "We couldn't load this tour. Please try again or check the ID."
      });
    }
  }, [error, tourId]);
  
  useEffect(() => {
    if (tour) {
      logger.debug(`Loaded tour: ${tour.tourName}`, {
        tourId: tour.id,
        date: tour.date,
        location: tour.location,
      });
    }
  }, [tour]);

  const tryUseMockTour = () => {
    const mockTour = mockTours.find(t => t.id === tourId);
    if (mockTour) {
      logger.debug("Using mock tour data as fallback");
      return mockTour;
    }
    return null;
  };
  
  if (isLoading || guidesLoading) {
    return <LoadingState />;
  }
  
  if (error || !tour) {
    const mockTour = tryUseMockTour();
    
    if (mockTour) {
      logger.debug("Using mock tour as fallback after fetch error");
      return (
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex mb-4">
            <button 
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm flex items-center gap-2"
              onClick={() => navigate("/tours")}
            >
              <ArrowLeft className="h-4 w-4" />
              Using demo data - Back to tours
            </button>
          </div>
          
          <NormalizedTourContent
            tour={mockTour}
            tourId={tourId}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      );
    }
      
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
      <div>
        <button 
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm flex items-center gap-2"
          onClick={() => navigate("/tours")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tour Overview
        </button>
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
