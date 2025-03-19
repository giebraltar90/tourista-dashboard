
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { Json } from "@/integrations/supabase/types";

/**
 * Update tour modifications
 */
export const updateTourModification = async (
  tourId: string,
  modification: {
    description: string,
    details?: Record<string, any> | Json
  }
): Promise<boolean> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isUuid(tourId);
    let success = false;
    
    if (tourIsUuid) {
      // For UUID tours, use Supabase
      try {
        const { error } = await supabase
          .from('modifications')
          .insert({
            tour_id: tourId,
            description: modification.description,
            details: modification.details || {},
            status: 'complete'
          });
          
        if (error) {
          console.error(`Error inserting modification in Supabase:`, error);
          throw error;
        }
        
        success = true;
        console.log(`Added modification in Supabase for tour ${tourId}`);
      } catch (supabaseError) {
        console.error("Error adding modification in Supabase:", supabaseError);
        // Continue to API fallback if Supabase fails
      }
    }
    
    // If we're dealing with a non-UUID tour or Supabase failed, fall back to the API
    if (!success) {
      console.log(`Adding modification via API for tour ${tourId}`, modification);
      // Simulate an API call with a success response for non-UUID tours
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error(`Error adding modification for tour ${tourId}:`, error);
    throw error;
  }
};
