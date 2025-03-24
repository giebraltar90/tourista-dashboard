
import { useQuery } from "@tanstack/react-query";
import { useRole } from "@/contexts/RoleContext";
import { fetchToursFromSupabase } from "@/services/api/tour/fetchSupabaseTours";

export const useGuideTours = () => {
  const { guideName } = useRole();
  
  return useQuery({
    queryKey: ["guideTours", guideName],
    queryFn: async () => {
      if (!guideName) return [];
      
      try {
        // Fetch tours assigned to this guide
        const tours = await fetchToursFromSupabase();
        
        return tours.filter(tour => {
          // Check if the guide is assigned to this tour in any position
          return (
            tour.guide1 === guideName ||
            tour.guide2 === guideName ||
            tour.guide3 === guideName ||
            tour.tourGroups?.some(group => group.guideName === guideName)
          );
        });
      } catch (error) {
        console.error("Error fetching guide tours:", error);
        return [];
      }
    },
    enabled: !!guideName,
  });
};
