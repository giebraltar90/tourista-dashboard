
import { supabase, supabaseWithRetry, invalidateTourCache } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { updateGroupGuideDirectly } from "@/hooks/group-management/services/participantService/syncService";

/**
 * Sync all guide assignments for a tour to ensure consistency
 */
export const syncTourGuideAssignments = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug("🔄 [GUIDE_SYNC] Syncing guide assignments for tour:", tourId);
    
    // Get all groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, guide_id, name')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error("Error fetching groups for guide sync:", groupsError);
      return false;
    }
    
    if (!groups || groups.length === 0) {
      logger.debug("No groups to sync for tour:", tourId);
      return true;
    }
    
    // For each group, verify guide assignment is correctly set
    let allSuccessful = true;
    for (const group of groups) {
      try {
        // Use retry mechanism to handle intermittent issues
        await supabaseWithRetry(async () => {
          // Check if guide exists if guide_id is set
          if (group.guide_id) {
            const { data: guide, error: guideError } = await supabase
              .from('guides')
              .select('id, name')
              .eq('id', group.guide_id)
              .single();
              
            // If guide not found, clear the guide_id to prevent inconsistency
            if (guideError || !guide) {
              logger.warn(`Guide ${group.guide_id} not found for group ${group.id}, clearing guide assignment`);
              
              const { error: updateError } = await supabase
                .from('tour_groups')
                .update({ 
                  guide_id: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', group.id);
                
              if (updateError) throw updateError;
            }
          }
          
          return { success: true };
        });
      } catch (error) {
        logger.error(`Error syncing guide for group ${group.id}:`, error);
        allSuccessful = false;
      }
    }
    
    // Invalidate any cached data for this tour
    invalidateTourCache(tourId);
    
    return allSuccessful;
  } catch (error) {
    logger.error("Error in syncTourGuideAssignments:", error);
    return false;
  }
};

/**
 * Directly update a guide assignment, bypassing any problematic DB triggers
 */
export const assignGuideToGroup = async (
  groupId: string,
  guideId: string | null,
  groupName: string
): Promise<boolean> => {
  try {
    logger.debug("🔄 [ASSIGN_GUIDE] Direct assignment:", { groupId, guideId, groupName });
    
    // Use the direct update function from syncService
    const success = await updateGroupGuideDirectly(groupId, guideId, groupName);
    
    if (!success) {
      // Fallback to a simple update if the direct method fails
      const { error } = await supabase
        .from('tour_groups')
        .update({ 
          guide_id: guideId,
          name: groupName,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);
        
      if (error) {
        logger.error("🔄 [ASSIGN_GUIDE] Error in fallback update:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error("Error in assignGuideToGroup:", error);
    return false;
  }
};
