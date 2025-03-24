
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { Loading } from "@/components/ui/loading";
import { useRole } from "@/contexts/RoleContext";
import { useTourById } from "@/hooks/useTourData";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  return <TourDetailsContent tourId={id || ""} />;
};

// Separate component for the tour details content
const TourDetailsContent = ({ tourId }: { tourId: string }) => {
  const { data: tour, isLoading, error } = useTourById(tourId);
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  // Log errors for debugging
  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${tourId}:`, error);
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
    return <Loading />;
  }
  
  if (error || !tour) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-8 text-center bg-muted rounded-lg">
          <h2 className="text-xl font-medium mb-2">Tour not found</h2>
          <p className="text-muted-foreground">We couldn't find a tour with the specified ID.</p>
          {error && (
            <p className="text-red-500 mt-2">Error: {error.message}</p>
          )}
        </div>
      </div>
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
