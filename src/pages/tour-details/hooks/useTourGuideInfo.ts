
import { useState, useEffect } from "react";
import { useGuideInfo } from "@/hooks/guides/useGuideInfo";
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";

/**
 * Custom hook to get guide information for a tour
 */
export const useTourGuideInfo = (tour: TourCardProps | null) => {
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  
  // Fetch guide info using the useGuideInfo hook
  const guide1Data = tour?.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Data = tour?.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Data = tour?.guide3 ? useGuideInfo(tour.guide3) : null;

  useEffect(() => {
    // Update guide1Info when data changes
    if (tour?.guide1) {
      if (guide1Data) {
        // If guide data is available, use it
        const updatedInfo = { ...guide1Data };
        
        // Special case: Sophie Miller is always a GC guide
        if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
          updatedInfo.guideType = 'GC';
        }
        
        setGuide1Info(updatedInfo);
      } else {
        // Create a fallback guide info if no data is available
        const isSophieMiller = tour.guide1.toLowerCase().includes('sophie miller');
        setGuide1Info({
          id: "guide1",
          name: tour.guide1,
          birthday: new Date(),
          guideType: isSophieMiller ? 'GC' : 'GA Ticket'
        });
      }
    } else {
      setGuide1Info(null);
    }
  }, [tour?.guide1, guide1Data]);

  useEffect(() => {
    // Update guide2Info when data changes
    if (tour?.guide2) {
      if (guide2Data) {
        // If guide data is available, use it
        const updatedInfo = { ...guide2Data };
        
        // Special case: Sophie Miller is always a GC guide
        if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
          updatedInfo.guideType = 'GC';
        }
        
        setGuide2Info(updatedInfo);
      } else {
        // Create a fallback guide info if no data is available
        const isSophieMiller = tour.guide2.toLowerCase().includes('sophie miller');
        setGuide2Info({
          id: "guide2",
          name: tour.guide2,
          birthday: new Date(),
          guideType: isSophieMiller ? 'GC' : 'GA Ticket'
        });
      }
    } else {
      setGuide2Info(null);
    }
  }, [tour?.guide2, guide2Data]);

  useEffect(() => {
    // Update guide3Info when data changes
    if (tour?.guide3) {
      if (guide3Data) {
        // If guide data is available, use it
        const updatedInfo = { ...guide3Data };
        
        // Special case: Sophie Miller is always a GC guide
        if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
          updatedInfo.guideType = 'GC';
        }
        
        setGuide3Info(updatedInfo);
      } else {
        // Create a fallback guide info if no data is available
        const isSophieMiller = tour.guide3.toLowerCase().includes('sophie miller');
        setGuide3Info({
          id: "guide3",
          name: tour.guide3,
          birthday: new Date(),
          guideType: isSophieMiller ? 'GC' : 'GA Ticket'
        });
      }
    } else {
      setGuide3Info(null);
    }
  }, [tour?.guide3, guide3Data]);

  return { guide1Info, guide2Info, guide3Info };
};
