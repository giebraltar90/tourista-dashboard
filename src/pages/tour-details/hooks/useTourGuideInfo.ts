
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
        const createFallbackGuide = (name: string, fakeType?: GuideType): GuideInfo => ({
          name,
          birthday: new Date(),
          guideType: fakeType || getRandomGuideType() // Randomly assign a guide type for testing
        });
        
        // Helper function to safely get guide info
        const safeGetGuideInfo = (guideName: string | undefined, defaultType?: GuideType) => {
          if (!guideName) return null;
          try {
            // For testing/development, we'll randomize guide types
            // In production, this would make a call to get the real guide type
            return {
              name: guideName,
              birthday: new Date(),
              guideType: defaultType || getRandomGuideType()
            };
          } catch (error) {
            console.error(`Error fetching guide info for ${guideName}:`, error);
            return createFallbackGuide(guideName, defaultType);
          }
        };
        
        // Generate random guide type for testing - in production, this data would come from the database
        function getRandomGuideType(): GuideType {
          const types: GuideType[] = ['GA Ticket', 'GA Free', 'GC'];
          return types[Math.floor(Math.random() * types.length)];
        }
        
        // Set guide info with randomized types for testing purposes
        if (tour.guide1) {
          setGuide1Info(safeGetGuideInfo(tour.guide1, 'GA Ticket'));
        }
        
        if (tour.guide2) {
          setGuide2Info(safeGetGuideInfo(tour.guide2, 'GA Free'));
        }
        
        if (tour.guide3) {
          setGuide3Info(safeGetGuideInfo(tour.guide3, 'GC'));
        }
      } catch (error) {
        console.error("Error loading guide information:", error);
      }
    };
    
    fetchGuideInfo();
  }, [tour]);

  return { guide1Info, guide2Info, guide3Info };
};
