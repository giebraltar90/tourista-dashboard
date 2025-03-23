
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTourData } from "./types";

/**
 * Fetch base tour data from Supabase
 */
export const fetchBaseTourData = async (tourId: string): Promise<SupabaseTourData | null> => {
  try {
    console.log(`DATABASE DEBUG: Fetching tour data for ID: ${tourId}`);
    
    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        id, date, location, tour_name, tour_type, start_time, 
        reference_code, guide1_id, guide2_id, guide3_id, 
        num_tickets, is_high_season,
        tour_groups (id, name, size, entry_time, guide_id, child_count)
      `)
      .eq('id', tourId)
      .single();
      
    if (error) {
      console.error("DATABASE DEBUG: Error fetching tour:", error);
      return null;
    }
    
    if (!tour) {
      console.error("DATABASE DEBUG: No tour found for ID:", tourId);
      return null;
    }
    
    console.log("DATABASE DEBUG: Using Supabase tour data:", tour);
    return tour;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchBaseTourData:", error);
    return null;
  }
};
