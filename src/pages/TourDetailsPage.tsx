
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
import { Button } from "@/components/ui/button";

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const tourId = id || "";
  
  logger.debug(`Attempting to load tour with ID: ${tourId}`);
  
  const { data: tour, isLoading, error, refetch } = useTourById(tourId);
  
  const { guide1Info, guide2Info, guide3Info, isLoading: guidesLoading } = useTourGuideInfo(tour);

  // Effect to log errors
  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${tourId}:`, error);
      toast.error("Error loading tour data", {
        description: "We couldn't load this tour. Please try again or check the ID."
      });
    }
  }, [error, tourId]);
  
  // Effect to log successful tour load
  useEffect(() => {
    if (tour) {
      logger.debug(`Successfully loaded tour: ${tour.tourName}`, {
        tourId: tour.id,
        date: tour.date instanceof Date ? tour.date.toISOString() : String(tour.date),
        tourDateType: typeof tour.date,
        location: tour.location,
        groupsCount: tour.tourGroups?.length || 0,
        firstGroupId: tour.tourGroups?.[0]?.id || 'none',
        guide1: tour.guide1 || 'None',
        guide2: tour.guide2 || 'None',
        guide3: tour.guide3 || 'None'
      });
    }
  }, [tour]);

  // Function to try using mock tour data as fallback
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
  
  // Handle edge case where tour data is empty but no error is thrown
  if (!tour && !error) {
    const mockTour = tryUseMockTour();
    
    if (mockTour) {
      logger.debug("Tour data is empty but no error was thrown. Using mock tour as fallback.");
      return (
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex mb-4">
            <Button 
              variant="outline"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
              onClick={() => navigate("/tours")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Using demo data - Back to tours
            </Button>
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
  }
  
  if (error || !tour) {
    const mockTour = tryUseMockTour();
    
    if (mockTour) {
      logger.debug("Using mock tour as fallback after fetch error");
      return (
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex mb-4">
            <Button 
              variant="outline"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
              onClick={() => navigate("/tours")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Using demo data - Back to tours
            </Button>
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
        error={error}
      />
    );
  }
  
  // Check if we have a minimal valid tour with groups
  const isTourDataValid = tour && 
                       tour.id && 
                       tour.tourName && 
                       Array.isArray(tour.tourGroups);

  if (!isTourDataValid) {
    logger.error(`Tour data is invalid for ID ${tourId}:`, {
      hasId: !!tour?.id,
      hasTourName: !!tour?.tourName,
      hasGroups: Array.isArray(tour?.tourGroups),
      groupsCount: Array.isArray(tour?.tourGroups) ? tour.tourGroups.length : 0
    });
    
    const mockTour = tryUseMockTour();
    
    if (mockTour) {
      logger.debug("Tour data is invalid. Using mock tour as fallback.");
      return (
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex mb-4">
            <Button 
              variant="outline"
              className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
              onClick={() => navigate("/tours")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Using demo data - Back to tours
            </Button>
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
    
    return (
      <ErrorState 
        message="The tour data appears to be invalid or incomplete." 
        tourId={tourId} 
        onRetry={() => refetch()}
      />
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <Button 
          variant="outline"
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
