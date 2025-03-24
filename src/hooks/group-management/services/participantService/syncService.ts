
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { transformToVentrataParticipant } from "./transform";
import { toast } from "sonner";

/**
 * Function to ensure the sync function is available
 */
export const ensureSyncFunction = async () => {
  try {
    const { data, error } = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: '00000000-0000-0000-0000-000000000000' // Dummy ID to check if function exists
    });
    
    if (error && error.message.includes('does not exist')) {
      logger.error("Database function 'sync_all_tour_groups' not found. Please contact an administrator.");
      toast.error("Database sync function not found. Some features may not work correctly.");
    }
  } catch (err) {
    logger.error("Error checking for sync function:", err);
  }
};

/**
 * Sync tour group sizes with actual participant counts
 */
export const syncTourGroupSizes = async (tourId: string) => {
  try {
    logger.debug("[syncTourGroupSizes] Starting sync for tour:", tourId);
    
    // Call the RPC function to sync all groups for the tour
    const { error } = await supabase.rpc('sync_all_tour_groups', {
      p_tour_id: tourId
    });
    
    if (error) {
      logger.error("[syncTourGroupSizes] Error syncing tour groups:", error);
      return false;
    }
    
    logger.debug("[syncTourGroupSizes] Successfully synced tour groups");
    return true;
  } catch (err) {
    logger.error("[syncTourGroupSizes] Exception in syncTourGroupSizes:", err);
    return false;
  }
};

/**
 * Calculate the total size and child count for a group based on its participants
 */
export const calculateSizesFromParticipants = (group: any) => {
  if (!group || !Array.isArray(group.participants)) {
    return { size: 0, childCount: 0 };
  }
  
  let size = 0;
  let childCount = 0;
  
  for (const participant of group.participants) {
    const count = participant.count || 1;
    const childCountValue = participant.childCount || participant.child_count || 0;
    
    size += count;
    childCount += childCountValue;
  }
  
  return { size, childCount };
};

/**
 * Sync a single group's size and child_count with its participants
 */
export const syncGroupWithParticipants = async (group: any) => {
  try {
    if (!group || !group.id) return false;
    
    const { size, childCount } = calculateSizesFromParticipants(group);
    
    logger.debug(`[syncGroupWithParticipants] Updating group ${group.id} with size=${size}, childCount=${childCount}`);
    
    const { error } = await supabase
      .from('tour_groups')
      .update({
        size: size,
        child_count: childCount
      })
      .eq('id', group.id);
      
    if (error) {
      logger.error("[syncGroupWithParticipants] Error updating group:", error);
      return false;
    }
    
    // Update local group data with calculated values
    if (group) {
      group.size = size;
      group.childCount = childCount;
    }
    
    return true;
  } catch (err) {
    logger.error("[syncGroupWithParticipants] Exception in syncGroupWithParticipants:", err);
    return false;
  }
};
