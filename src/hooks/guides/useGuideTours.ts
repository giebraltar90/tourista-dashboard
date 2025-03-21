
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
          .select('*')
          .or(`guide1.eq.${guideName},guide2.eq.${guideName},guide3.eq.${guideName}`);
        
        if (error) {
          console.error("Error fetching guide tours:", error);
          return [];
        }
        
        return toursData ? toursData.map((tour): TourCardProps => ({
          id: tour.id,
          date: new Date(tour.date),
          tourName: tour.tour_name || "Unnamed Tour",
          location: tour.location || "Unknown Location",
          guide1: tour.guide1 || "",
          guide2: tour.guide2 || "",
          guide3: tour.guide3 || "",
          totalParticipants: tour.total_participants || 0,
          childCount: tour.child_count || 0,
          referenceCode: tour.reference_code || "",
          numTickets: tour.num_tickets || 0,
          isHighSeason: tour.is_high_season || false,
          tourGroups: tour.tour_groups || [],
          tourType: tour.tour_type || "Regular",
          isBelowMinimum: (tour.total_participants || 0) < 8
        })) : [];
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
