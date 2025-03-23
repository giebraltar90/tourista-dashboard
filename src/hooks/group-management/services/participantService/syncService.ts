
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Updates the calculated sizes on tour groups based on their participants
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug(`🔁 [GROUP_SYNC] Syncing tour group sizes for tour ${tourId}`);
    
    // First get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error("🔁 [GROUP_SYNC] Error fetching tour groups for size sync:", groupsError);
      return false;
    }
    
    logger.debug(`🔁 [GROUP_SYNC] Fetched ${tourGroups.length} groups for size sync`);
    
    // Update each group's size and child_count based on participants
    for (const group of tourGroups) {
      if (!Array.isArray(group.participants)) {
        logger.debug(`🔁 [GROUP_SYNC] Group ${group.id} (${group.name || 'Unnamed'}) has no participants array, skipping`);
        continue;
      }
      
      let totalSize = 0;
      let totalChildCount = 0;
      
      // Calculate from participants
      for (const participant of group.participants) {
        totalSize += participant.count || 1;
        totalChildCount += participant.child_count || 0;
        
        logger.debug(`🔁 [GROUP_SYNC] Adding participant ${participant.id} with count ${participant.count || 1} and childCount ${participant.child_count || 0}`);
      }
      
      logger.debug(`🔁 [GROUP_SYNC] Updating group ${group.id} (${group.name || 'Unnamed'}) with size ${totalSize} and childCount ${totalChildCount} from ${group.participants.length} participants`);
      
      // Update the group with calculated values
      const { error: updateError } = await supabase
        .from('tour_groups')
        .update({
          size: totalSize,
          child_count: totalChildCount
        })
        .eq('id', group.id);
        
      if (updateError) {
        logger.error(`🔁 [GROUP_SYNC] Error updating size for group ${group.id}:`, updateError);
      }
    }
    
    // Add a longer delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verify the updates
    const { data: verifyGroups, error: verifyError } = await supabase
      .from('tour_groups')
      .select('id, name, size, child_count, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (!verifyError && Array.isArray(verifyGroups)) {
      for (const group of verifyGroups) {
        let calculatedSize = 0;
        let calculatedChildCount = 0;
        
        if (Array.isArray(group.participants)) {
          for (const p of group.participants) {
            calculatedSize += p.count || 1;
            calculatedChildCount += p.child_count || 0;
          }
          
          if (calculatedSize !== group.size || calculatedChildCount !== group.child_count) {
            logger.warn(`🔁 [GROUP_SYNC] Verification failed for group ${group.id} (${group.name || 'Unnamed'})`, {
              dbSize: group.size,
              calculatedSize,
              dbChildCount: group.child_count,
              calculatedChildCount,
              participantCount: group.participants.length
            });
          } else {
            logger.debug(`🔁 [GROUP_SYNC] Verification passed for group ${group.id} (${group.name || 'Unnamed'})`);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    logger.error("🔁 [GROUP_SYNC] Error synchronizing tour group sizes:", error);
    return false;
  }
};

