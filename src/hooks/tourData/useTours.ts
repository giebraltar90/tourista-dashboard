
import { useQuery } from "@tanstack/react-query";
import { fetchTours } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
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
        // First try to fetch from Supabase
        const { data, error } = await supabase
          .from('tours')
          .select(`
            id, date, location, tour_name, reference_code, start_time, num_tickets, is_high_season,
            tour_type, guide1_id, guide2_id, guide3_id,
            tour_groups (
              id, name, size, entry_time, child_count, guide_id
            )
          `)
          .order('date', { ascending: true });
        
        if (error) {
          console.error("Supabase query error:", error);
          console.log("Falling back to mock data");
          return mockTours;
        }
        
        if (data && data.length > 0) {
          console.log("Received tours from Supabase:", data);
          // For now, return mock data as placeholder
        }
        
        console.log("Using mock tour data");
        return mockTours;
      } catch (error) {
        console.error("Error fetching tours:", error);
        return mockTours;
      }
    },
    // Pass through any options provided
    ...options,
  });
};
