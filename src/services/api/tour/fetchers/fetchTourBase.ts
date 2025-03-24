
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTourData } from "./types";

/**
 * Fetch base tour data from Supabase
 */
export const fetchBaseTourData = async (tourId: string): Promise<SupabaseTourData | null> => {
  try {
    console.log(`DATABASE DEBUG: Fetching tour data for ID: ${tourId}`);
    
    if (!tourId) {
      console.error("DATABASE DEBUG: Empty tourId provided to fetchBaseTourData");
      return null;
    }
    
    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        id, date, location, tour_name, tour_type, start_time, 
        reference_code, guide1_id, guide2_id, guide3_id, 
        num_tickets, is_high_season,
        tour_groups (id, name, size, entry_time, guide_id, child_count)
      `)
      .eq('id', tourId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
    if (error) {
      console.error("DATABASE DEBUG: Error fetching tour:", error);
      return null;
    }
    
    if (!tour) {
      console.error("DATABASE DEBUG: No tour found for ID:", tourId);
      return null;
    }
    
    // Ensure we have a tour_groups array, even if it's empty
    if (!tour.tour_groups) {
      tour.tour_groups = [];
    }
    
    console.log("DATABASE DEBUG: Using Supabase tour data:", {
      id: tour.id,
      name: tour.tour_name,
      date: tour.date,
      hasGroups: !!tour.tour_groups,
      groupCount: tour.tour_groups ? tour.tour_groups.length : 0
    });
    
    return tour;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchBaseTourData:", error);
    return null;
  }
};
