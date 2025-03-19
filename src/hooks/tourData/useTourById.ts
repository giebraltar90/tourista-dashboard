
import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/services/ventrataApi";
import { mockTours } from "@/data/mockData";

export const useTourById = (tourId: string) => {
  console.log("useTourById called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("Fetching tour data for ID:", tourId);
      
      try {
        // For now, just use mock data or the simplified API
        const tourData = await fetchTourById(tourId);
        console.log("Found tour data:", tourData);
        
        if (!tourData) return null;
        
        // Ensure isHighSeason is properly converted to boolean using double negation
        tourData.isHighSeason = !!tourData.isHighSeason;
        
        // Ensure guide IDs are properly set on tour groups to maintain guide assignments
        tourData.tourGroups = tourData.tourGroups.map(group => {
          // If group name clearly indicates a guide, ensure guideId is set appropriately
          if (tourData.guide1 && group.name && group.name.includes(tourData.guide1)) {
            console.log(`Setting guide1 for group ${group.name}`);
            group.guideId = group.guideId || "guide1";
          } else if (tourData.guide2 && group.name && group.name.includes(tourData.guide2)) {
            console.log(`Setting guide2 for group ${group.name}`);
            group.guideId = group.guideId || "guide2";
          } else if (tourData.guide3 && group.name && group.name.includes(tourData.guide3)) {
            console.log(`Setting guide3 for group ${group.name}`);
            group.guideId = group.guideId || "guide3";
          }
          return group;
        });
        
        console.log("Cleaned tour data with isHighSeason:", tourData.isHighSeason);
        console.log("Tour groups after cleaning:", tourData.tourGroups);
        
        return tourData;
      } catch (error) {
        console.error("Error in useTourById:", error);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes cache time
    enabled: !!tourId,         // Only run the query if tourId is provided
  });
};
