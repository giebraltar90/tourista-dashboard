
import { supabase, supabaseWithRetry, invalidateTourCache } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { updateGroupGuideDirectly } from "@/hooks/group-management/services/participantService/sync/guideUpdateService";

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

/**
 * Update a guide in Supabase (multiple fallback approaches)
 */
export const updateGuideInSupabase = async (
  tourId: string, 
  groupId: string, 
  guideId: string | null | undefined, 
  groupName: string
): Promise<boolean> => {
  try {
    logger.debug("🔄 [UPDATE_GUIDE] Starting guide update in Supabase:", {
      tourId,
      groupId,
      guideId: guideId || 'null',
      groupName
    });
    
    // Strategy 1: Use assignGuideToGroup which has its own fallbacks
    const success = await assignGuideToGroup(groupId, guideId || null, groupName);
    
    if (success) {
      logger.debug("🔄 [UPDATE_GUIDE] Successfully updated guide through assignGuideToGroup");
      return true;
    }
    
    // Strategy 2: Try direct update with retry
    try {
      const result = await supabaseWithRetry(async () => {
        const { error } = await supabase
          .from('tour_groups')
          .update({ 
            guide_id: guideId || null,
            name: groupName,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId);
          
        if (error) throw error;
        return { success: true };
      });
      
      if (result && result.success) {
        logger.debug("🔄 [UPDATE_GUIDE] Successfully updated guide with retry mechanism");
        return true;
      }
    } catch (error) {
      logger.debug("🔄 [UPDATE_GUIDE] Retry mechanism failed:", error);
    }
    
    // Strategy 3: Try RPC functions
    try {
      const { error } = await supabase.rpc(
        'update_group_guide_no_triggers',
        {
          p_group_id: groupId,
          p_guide_id: guideId || null,
          p_name: groupName
        }
      );
      
      if (!error) {
        logger.debug("🔄 [UPDATE_GUIDE] Successfully updated guide via RPC function");
        return true;
      }
      
      logger.debug("🔄 [UPDATE_GUIDE] RPC function failed:", error);
    } catch (error) {
      logger.debug("🔄 [UPDATE_GUIDE] Error calling RPC function:", error);
    }
    
    // Final fallback: Try updating in steps
    try {
      // Update guide_id first
      const { error: guideError } = await supabase
        .from('tour_groups')
        .update({ guide_id: guideId || null })
        .eq('id', groupId);
        
      // Then update name
      const { error: nameError } = await supabase
        .from('tour_groups')
        .update({ name: groupName })
        .eq('id', groupId);
        
      if (!guideError && !nameError) {
        logger.debug("🔄 [UPDATE_GUIDE] Successfully updated guide with separate updates");
        return true;
      }
      
      logger.debug("🔄 [UPDATE_GUIDE] Separate updates failed:", { guideError, nameError });
    } catch (error) {
      logger.debug("🔄 [UPDATE_GUIDE] Error with separate updates:", error);
    }
    
    logger.error("🔄 [UPDATE_GUIDE] All update strategies failed");
    return false;
  } catch (error) {
    logger.error("🔄 [UPDATE_GUIDE] Unexpected error:", error);
    return false;
  }
};
