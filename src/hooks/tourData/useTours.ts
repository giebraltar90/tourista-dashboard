
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        console.log("Fetching tours from Supabase");
        const { data: supabaseTours, error } = await supabase
          .from('tours')
          .select(`
            id, date, location, tour_name, tour_type, start_time, 
            reference_code, guide1_id, guide2_id, guide3_id, 
            num_tickets, is_high_season,
            tour_groups (id, name, size, entry_time, guide_id, child_count,
              participants (id, name, count, booking_ref, child_count)
            )
          `)
          .order('date', { ascending: true });
          
        if (error) {
          console.error("Error fetching tours:", error);
          throw error;
        }
        
        if (!supabaseTours || supabaseTours.length === 0) {
          console.log("No tours found, you may need to create test data");
          return [];
        }
        
        console.log("Successfully fetched tours from Supabase:", supabaseTours);
        
        // Transform the Supabase data to match our TourCardProps structure
        return supabaseTours.map(tour => ({
          id: tour.id,
          date: new Date(tour.date),
          location: tour.location,
          tourName: tour.tour_name,
          tourType: tour.tour_type,
          startTime: tour.start_time,
          referenceCode: tour.reference_code,
          guide1: tour.guide1_id || "",
          guide2: tour.guide2_id || "",
          guide3: tour.guide3_id || "",
          tourGroups: tour.tour_groups.map(group => ({
            id: group.id,
            name: group.name,
            size: group.size,
            entryTime: group.entry_time,
            childCount: group.child_count || 0,
            guideId: group.guide_id,
            participants: group.participants?.map(p => ({
              id: p.id,
              name: p.name,
              count: p.count,
              bookingRef: p.booking_ref,
              childCount: p.child_count || 0
            })) || []
          })),
          numTickets: tour.num_tickets || 0,
          isHighSeason: tour.is_high_season || false
        }));
      } catch (error) {
        console.error("Error fetching tours:", error);
        return [];
      }
    },
    // Pass through any options provided
    ...options,
  });
};
