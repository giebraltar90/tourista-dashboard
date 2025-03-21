
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { TourCardProps } from "@/components/tours/tour-card/types";

export function useGuideTours() {
  const { guideView } = useRole();
  const guideName = guideView?.guideName || "";
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['guide-tours', guideName],
    queryFn: async () => {
      if (!guideName) return [];
      
      try {
        // In a real app, you would fetch from your backend API
        // Here we're simulating by filtering all tours
        const { data: toursData, error } = await supabase
          .from('tours')
          .select(`
            *,
            tour_groups (*)
          `)
          .or(`guide1_id.eq.${guideName},guide2_id.eq.${guideName},guide3_id.eq.${guideName}`);
        
        if (error) {
          console.error("Error fetching guide tours:", error);
          return [];
        }
        
        return toursData ? toursData.map((tour): TourCardProps => {
          // Calculate total participants and child count from tour groups
          const tourGroups = tour.tour_groups || [];
          const totalParticipants = tourGroups.reduce((sum, group) => sum + (group.size || 0), 0);
          const childCount = tourGroups.reduce((sum, group) => sum + (group.child_count || 0), 0);
          
          // Get guide names from IDs or use empty string as fallback
          const guide1 = tour.guide1_id || "";
          const guide2 = tour.guide2_id || "";
          const guide3 = tour.guide3_id || "";
          
          return {
            id: tour.id,
            date: new Date(tour.date),
            tourName: tour.tour_name || "Unnamed Tour",
            location: tour.location || "Unknown Location",
            guide1,
            guide2,
            guide3,
            referenceCode: tour.reference_code || "",
            numTickets: tour.num_tickets || 0,
            isHighSeason: tour.is_high_season || false,
            tourGroups: tourGroups.map(group => ({
              id: group.id,
              name: group.name,
              size: group.size || 0,
              entryTime: group.entry_time || "",
              childCount: group.child_count || 0,
              guideId: group.guide_id
            })),
            tourType: tour.tour_type || "default",
            isBelowMinimum: totalParticipants < 8,
            startTime: tour.start_time || "00:00" // Adding required field from type
          };
        }) : [];
      } catch (error) {
        console.error("Error in useGuideTours:", error);
        return [];
      }
    },
    enabled: !!guideName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return { data: data || [], isLoading, error, guideName };
}
