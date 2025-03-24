
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { Loading } from "@/components/ui/loading";
import { useRole } from "@/contexts/RoleContext";
import { useTourById } from "@/hooks/useTourData";
import { useTourGuideInfo } from "@/hooks/tour-details/useTourGuideInfo";
import { logger } from "@/utils/logger";

const TourDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tour, isLoading, error } = useTourById(id || "");
  const { guide1Info, guide2Info, guide3Info } = useTourGuideInfo(tour);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Log errors for debugging
  useEffect(() => {
    if (error) {
      logger.error(`Failed to load tour with ID ${id}:`, error);
    }
  }, [error, id]);
  
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
    <NormalizedTourContent
      tour={tour}
      tourId={id || ""}
      guide1Info={guide1Info}
      guide2Info={guide2Info}
      guide3Info={guide3Info}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default TourDetailsPage;
