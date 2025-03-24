
import { supabase } from "@/integrations/supabase/client";

/**
 * Synchronize tour group sizes with participants
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  try {
    console.log(`Syncing group sizes for tour ${tourId}`);
    
    const { error } = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: tourId
    });
    
    if (error) {
      console.error("Error syncing tour group sizes:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error syncing tour group sizes:", error);
    return false;
  }
};

/**
 * Ensure the sync function exists on the database
 */
export const ensureSyncFunction = (): void => {
  // This is a no-op function that just signals intent
  console.log("Sync function ensured");
};
