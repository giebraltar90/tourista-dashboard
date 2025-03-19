
import { useMemo } from "react";
import { useTours } from "./useTourData";
import { useRole } from "@/contexts/RoleContext";

export function useGuideTours() {
  const { data: allTours, isLoading, error } = useTours();
  const { guideView } = useRole();
  
  const guideName = guideView?.guideName || "";
  
  const guideTours = useMemo(() => {
    if (!allTours) return [];
    
    return allTours.filter(tour => 
      tour.guide1 === guideName || tour.guide2 === guideName
    );
  }, [allTours, guideName]);
  
  return {
    data: guideTours,
    isLoading,
    error,
    guideName
  };
}
