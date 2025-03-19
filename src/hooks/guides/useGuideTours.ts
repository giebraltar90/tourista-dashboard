
import { useMemo } from "react";
import { toast } from "sonner";
import { useTours } from "../tourData/useTours";
import { useRole } from "@/contexts/RoleContext";
import { useGuideInfo } from "./useGuideInfo";

export function useGuideTours() {
  const { data: allTours, isLoading, error } = useTours();
  const { guideView } = useRole();
  
  const guideName = guideView?.guideName || "";
  
  const guideTours = useMemo(() => {
    if (!allTours) return [];
    
    // Filter tours where the guide is either guide1 or guide2
    return allTours.filter(tour => 
      tour.guide1 === guideName || tour.guide2 === guideName || tour.guide3 === guideName
    );
  }, [allTours, guideName]);
  
  // If we're in guide view but there are no tours, show a notification
  useMemo(() => {
    if (guideView && allTours && !isLoading && guideTours.length === 0) {
      toast.info(`No tours found for guide: ${guideName}`);
    }
  }, [guideView, allTours, isLoading, guideTours.length, guideName]);
  
  return {
    data: guideTours,
    isLoading,
    error,
    guideName,
    guideInfo: useGuideInfo(guideName)
  };
}
