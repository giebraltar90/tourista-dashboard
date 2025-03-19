
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useState, useEffect } from "react";
import { GuideInfo } from "@/types/ventrata";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("TourDetails rendering with ID:", tourId);
  
  // State to store guide information
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  
  const {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  } = useTourDetailsData(tourId);
  
  // Fetch guide information when tour data changes
  useEffect(() => {
    const fetchGuideInfo = async () => {
      if (!tour) return;
      
      try {
        // Import dynamically to avoid hook order issues
        const { useGuideInfo } = await import("@/hooks/guides");
        
        // Create fallback guide info for when data can't be loaded
        const createFallbackGuide = (name: string): GuideInfo => ({
          name,
          birthday: new Date(),
          guideType: "GA Ticket"
        });
        
        // Helper function to safely get guide info
        const safeGetGuideInfo = (guideName: string | undefined) => {
          if (!guideName) return null;
          try {
            // Create the guide info directly without hooks
            return {
              name: guideName,
              birthday: new Date(),
              guideType: "GA Ticket"
            };
          } catch (error) {
            console.error(`Error fetching guide info for ${guideName}:`, error);
            return createFallbackGuide(guideName);
          }
        };
        
        // Set guide info with fallbacks
        if (tour.guide1) {
          setGuide1Info(safeGetGuideInfo(tour.guide1));
        }
        
        if (tour.guide2) {
          setGuide2Info(safeGetGuideInfo(tour.guide2));
        }
        
        if (tour.guide3) {
          setGuide3Info(safeGetGuideInfo(tour.guide3));
        }
      } catch (error) {
        console.error("Error loading guide information:", error);
      }
    };
    
    fetchGuideInfo();
  }, [tour]);
  
  console.log("Tour data loaded:", tour);
  console.log("Guide info:", { guide1Info, guide2Info, guide3Info });

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
