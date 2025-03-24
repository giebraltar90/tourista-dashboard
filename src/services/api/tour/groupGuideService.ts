
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Updates a guide assignment for a specific tour group
 * @param tourId - The ID of the tour
 * @param groupId - The ID of the group to update
 * @param guideId - The ID of the guide to assign, or undefined to remove assignment
 * @returns A boolean indicating success or failure
 */
export const updateGroupGuide = async (
  tourId: string,
  groupId: string,
  guideId?: string
): Promise<boolean> => {
  try {
    if (!tourId || !groupId) {
      logger.error("Missing required parameters for updateGroupGuide:", { tourId, groupId });
      return false;
    }

    logger.debug(`Updating guide for tour ${tourId}, group ${groupId}:`, {
      guideId: guideId || 'none (removing guide)'
    });
    
    // Build update object to set or remove guide_id
    const updateData: any = {
      guide_id: guideId === "_none" ? null : guideId
    };

    // Update the group's guide in the database
    const { error } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId)
      .eq('tour_id', tourId);
      
    if (error) {
      logger.error("Error updating group guide assignment:", error);
      return false;
    }
    
    // Emit event to trigger ticket recalculation
    EventEmitter.emit(`guide-change:${tourId}`);
    logger.debug("Successfully updated guide assignment");
    
    return true;
  } catch (error) {
    logger.error("Error updating group guide assignment:", error);
    return false;
  }
};

/**
 * Retrieve all guide assignments for a specific tour
 */
export const getGroupGuideAssignments = async (tourId: string) => {
  if (!tourId) return [];
  
  try {
    const { data, error } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (error) {
      logger.error("Error fetching guide assignments:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    logger.error("Error retrieving guide assignments:", error);
    return [];
  }
};
