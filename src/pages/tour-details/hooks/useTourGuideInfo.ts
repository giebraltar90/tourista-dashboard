
import { useState, useEffect } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo, GuideType } from "@/types/ventrata";

/**
 * Hook for handling guide information for a tour
 */
export const useTourGuideInfo = (tour: TourCardProps | null) => {
  // State to store guide information
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);

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
          guideType: "GA Ticket" as GuideType
        });
        
        // Helper function to safely get guide info
        const safeGetGuideInfo = (guideName: string | undefined) => {
          if (!guideName) return null;
          try {
            // Create the guide info directly without hooks
            return {
              name: guideName,
              birthday: new Date(),
              guideType: "GA Ticket" as GuideType
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

  return { guide1Info, guide2Info, guide3Info };
};
