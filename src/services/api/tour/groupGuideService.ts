
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { generateGroupName } from "@/hooks/group-management/utils/guideNameUtils";

/**
 * Update the guide assignment for a specific tour group
 */
export const updateGroupGuide = async (
  tourId: string,
  groupId: string,
  guideId: string | undefined | null
): Promise<boolean> => {
  try {
    logger.debug(`🔧 [groupGuideService] Updating guide assignment for group ${groupId} in tour ${tourId}`, {
      guideId: guideId || 'null'
    });
    
    // Generate new group name based on guide assignment
    // Fix: Pass correct arguments to generateGroupName
    const updatedName = await generateGroupName(groupId, guideId || null);
    
    // Update the group with the new guide and name
    const { error } = await supabase
      .from('tour_groups')
      .update({ 
        guide_id: guideId,
        name: updatedName,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);
      
    if (error) {
      logger.error(`🔧 [groupGuideService] Error updating guide for group ${groupId}:`, error);
      return false;
    }
    
    logger.debug(`🔧 [groupGuideService] Successfully updated guide for group ${groupId}`);
    return true;
  } catch (error) {
    logger.error(`🔧 [groupGuideService] Unexpected error updating guide:`, error);
    toast.error("An error occurred updating the guide");
    return false;
  }
};

/**
 * Synchronize group names with assigned guides
 */
export const syncGroupGuideNames = async (tourId: string): Promise<boolean> => {
  try {
    // Get all groups for this tour
    const { data: groups, error } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (error) {
      logger.error(`🔧 [groupGuideService] Error fetching groups for tour ${tourId}:`, error);
      return false;
    }
    
    // Update each group name based on its assigned guide
    for (const group of groups) {
      const updatedName = await generateGroupName(group.id, group.guide_id);
      
      // Only update if name is different
      if (updatedName !== group.name) {
        logger.debug(`🔧 [groupGuideService] Updating group ${group.id} name to "${updatedName}"`);
        
        const { error: updateError } = await supabase
          .from('tour_groups')
          .update({ 
            name: updatedName,
            updated_at: new Date().toISOString()
          })
          .eq('id', group.id);
          
        if (updateError) {
          logger.error(`🔧 [groupGuideService] Error updating name for group ${group.id}:`, updateError);
        }
      }
    }
    
    return true;
  } catch (error) {
    logger.error(`🔧 [groupGuideService] Unexpected error syncing group names:`, error);
    return false;
  }
};
