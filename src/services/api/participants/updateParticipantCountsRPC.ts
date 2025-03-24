
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Uses the sync_all_tour_groups RPC function to ensure accurate participant counts
 */
export const updateParticipantCounts = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug("💾 [API] Updating participant counts via RPC for tour:", tourId);
    
    const { error } = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: tourId
    });
    
    if (error) {
      logger.error("💾 [API] Error updating participant counts:", error);
      return false;
    }
    
    logger.debug("💾 [API] Successfully updated participant counts for tour:", tourId);
    return true;
  } catch (err) {
    logger.error("💾 [API] Exception updating participant counts:", err);
    return false;
  }
};
