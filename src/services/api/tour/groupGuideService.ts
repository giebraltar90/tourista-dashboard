
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
      guide_id: guideId === "_none" ? null : guideId,
      updated_at: new Date().toISOString() // Force timestamp update
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
    
    // BUGFIX: After updating group guide, update group names to match the assigned guide
    await syncGroupNamesWithGuides(tourId);
    
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

/**
 * Sync group names with their assigned guides to ensure consistency
 */
export const syncGroupNamesWithGuides = async (tourId: string): Promise<boolean> => {
  try {
    // Get all groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError || !groups) {
      logger.error("Error fetching groups for name sync:", groupsError);
      return false;
    }
    
    // For each group, update its name based on the guide assignment
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupIndex = i + 1; // 1-based index for display
      
      if (group.guide_id) {
        // Group has a guide, get guide name
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('name')
          .eq('id', group.guide_id)
          .maybeSingle();
          
        if (guideError) {
          logger.error(`Error fetching guide for group ${group.id}:`, guideError);
          continue;
        }
        
        if (guideData && guideData.name) {
          // Create expected group name with guide
          const expectedName = `Group ${groupIndex} (${guideData.name})`;
          
          // If name doesn't match expected, update it
          if (group.name !== expectedName) {
            const { error: updateError } = await supabase
              .from('tour_groups')
              .update({
                name: expectedName,
                updated_at: new Date().toISOString()
              })
              .eq('id', group.id);
              
            if (updateError) {
              logger.error(`Error updating group name for ${group.id}:`, updateError);
            } else {
              logger.debug(`Updated group name from "${group.name}" to "${expectedName}"`);
            }
          }
        }
      } else {
        // Group has no guide, should have a simple name
        const expectedName = `Group ${groupIndex}`;
        
        // If name doesn't match expected, update it
        if (group.name !== expectedName && group.name.includes('(')) {
          const { error: updateError } = await supabase
            .from('tour_groups')
            .update({
              name: expectedName,
              updated_at: new Date().toISOString()
            })
            .eq('id', group.id);
            
          if (updateError) {
            logger.error(`Error updating unassigned group name for ${group.id}:`, updateError);
          } else {
            logger.debug(`Updated unassigned group name from "${group.name}" to "${expectedName}"`);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    logger.error("Error in syncGroupNamesWithGuides:", error);
    return false;
  }
};
