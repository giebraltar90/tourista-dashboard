
import { supabase } from "@/integrations/supabase/client";
import { SupabaseModification } from "./types";

/**
 * Fetch modifications for a tour
 */
export const fetchModificationsForTour = async (tourId: string): Promise<SupabaseModification[]> => {
  try {
    const { data: modifications, error: modError } = await supabase
      .from('modifications')
      .select('*')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false });
      
    if (modError) {
      console.error("DATABASE DEBUG: Error fetching modifications:", modError);
      return [];
    }
    
    return modifications || [];
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchModificationsForTour:", error);
    return [];
  }
};
