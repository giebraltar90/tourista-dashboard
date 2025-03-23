
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { isValidUuid } from "./utils/guidesUtils";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Updates a guide's assignment to a group in Supabase directly with improved persistence
 */
export const updateGuideInSupabase = async (
  tourId: string, 
  groupId: string, 
  guideId: string | null,
  groupName?: string
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase:", { tourId, groupId });
    return false;
  }

  try {
    logger.debug(`Updating guide assignment in Supabase for tour ${tourId}, group ${groupId}:`, {
      guideId,
      groupName
    });
    
    // Build update object based on what data is provided
    const updateData: any = {};
    
    // Add guide_id to update
    if (guideId === null || guideId === "_none") {
      // Set to null to unassign
      updateData.guide_id = null;
      logger.debug("Setting guide_id to null (unassigning)");
    } else {
      // Add the guide ID
      updateData.guide_id = guideId;
      logger.debug(`Setting guide_id to: ${guideId}`);
    }
    
    // Only add name to update if it's provided
    if (groupName) {
      updateData.name = groupName;
    }
    
    // Always add updated_at timestamp to ensure the change is tracked
    updateData.updated_at = new Date().toISOString();

    // Log the actual data being sent to the database
    logger.debug("Sending to database:", updateData);

    // Try the more reliable update method with retry
    const { error, attempt } = await supabaseWithRetry
      .from('tour_groups')
      .updateWithRetry(updateData, { id: groupId, tour_id: tourId });
      
    if (error) {
      logger.error(`Error updating guide assignment after ${attempt} attempts:`, error);
      
      // Fall back to standard update if the retry method fails
      const { error: fallbackError } = await supabase
        .from('tour_groups')
        .update(updateData)
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (fallbackError) {
        logger.error("Fallback update also failed:", fallbackError);
        return false;
      }
    }
    
    // After successful update to the group, also update the guide_N_id in the tours table
    // This is critical for maintaining guide assignments properly
    if (guideId && guideId.startsWith("guide")) {
      const guideNumber = guideId.replace("guide", "");
      if (["1", "2", "3"].includes(guideNumber)) {
        const tourUpdateField = `guide${guideNumber}_id`;
        
        // For special guide IDs (guide1, guide2, guide3), find the actual guide UUID
        // by looking for a guide assigned to this group
        const { data: groupData, error: groupError } = await supabase
          .from('tour_groups')
          .select('guide_id')
          .eq('id', groupId)
          .single();
          
        if (!groupError && groupData?.guide_id) {
          // Update the corresponding field in the tours table
          const tourUpdateData: any = {};
          tourUpdateData[tourUpdateField] = groupData.guide_id;
          
          const { error: tourUpdateError } = await supabase
            .from('tours')
            .update(tourUpdateData)
            .eq('id', tourId);
            
          if (tourUpdateError) {
            logger.error(`Error updating ${tourUpdateField} in tours table:`, tourUpdateError);
            // Continue since the primary group update succeeded
          } else {
            logger.debug(`Successfully updated ${tourUpdateField} in tours table to ${groupData.guide_id}`);
          }
        }
      }
    }
    
    // Emit event to notify that guide assignments have changed
    EventEmitter.emit(`guide-assignment-updated:${tourId}`, { 
      tourId, 
      groupId, 
      guideId 
    });
    
    logger.debug("Successfully updated guide assignment in Supabase");
    return true;
  } catch (error) {
    logger.error("Error updating guide assignment:", error);
    return false;
  }
};

/**
 * Fully updates the guide references in tours table with improved reliability
 */
export const updateTourGuidesInDatabase = async (
  tourId: string,
  guide1Id: string | null,
  guide2Id: string | null,
  guide3Id: string | null
): Promise<boolean> => {
  try {
    logger.debug(`Updating all guides for tour ${tourId}:`, { guide1Id, guide2Id, guide3Id });
    
    const updateData: any = {};
    
    if (guide1Id !== undefined) {
      updateData.guide1_id = guide1Id === "_none" ? null : guide1Id;
    }
    
    if (guide2Id !== undefined) {
      updateData.guide2_id = guide2Id === "_none" ? null : guide2Id;
    }
    
    if (guide3Id !== undefined) {
      updateData.guide3_id = guide3Id === "_none" ? null : guide3Id;
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      logger.debug("No guide data to update");
      return true;
    }
    
    // Try the update with exponential backoff retry
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { error } = await supabase
        .from('tours')
        .update(updateData)
        .eq('id', tourId);
        
      if (!error) {
        logger.debug(`Successfully updated all guides for tour on attempt ${attempt}`);
        
        // Force update of any related groups to ensure consistency
        await updateTourGroupsGuideConsistency(tourId);
        
        return true;
      }
      
      logger.error(`Error updating tour guides (attempt ${attempt}/3):`, error);
      
      if (attempt < 3) {
        // Wait with exponential backoff before retrying
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
    
    return false;
  } catch (error) {
    logger.error("Error updating tour guides:", error);
    return false;
  }
};

/**
 * Ensures consistency between tours table guide assignments and tour_groups table
 */
const updateTourGroupsGuideConsistency = async (tourId: string): Promise<void> => {
  try {
    // First, get the current tour record to see guide assignments
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id, guide1_id, guide2_id, guide3_id')
      .eq('id', tourId)
      .single();
      
    if (tourError || !tourData) {
      logger.error("Error fetching tour for guide consistency check:", tourError);
      return;
    }
    
    // Get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError || !tourGroups) {
      logger.error("Error fetching tour groups for guide consistency check:", groupsError);
      return;
    }
    
    // Create a map of which guides are assigned to which groups
    const guideGroupMap: Record<string, string> = {};
    tourGroups.forEach(group => {
      if (group.guide_id) {
        guideGroupMap[group.guide_id] = group.id;
      }
    });
    
    // If tour has guides that aren't assigned to groups, assign them
    const guidesToCheck = [
      { fieldName: 'guide1_id', guideId: tourData.guide1_id },
      { fieldName: 'guide2_id', guideId: tourData.guide2_id },
      { fieldName: 'guide3_id', guideId: tourData.guide3_id }
    ];
    
    for (const { fieldName, guideId } of guidesToCheck) {
      if (guideId && !guideGroupMap[guideId]) {
        // This guide is in the tour but not assigned to any group
        // Find a group to assign it to
        const availableGroupIndex = tourGroups.findIndex(g => !g.guide_id);
        
        if (availableGroupIndex !== -1) {
          const groupToUpdate = tourGroups[availableGroupIndex];
          
          // Assign the guide to this group
          const { error: assignError } = await supabase
            .from('tour_groups')
            .update({ 
              guide_id: guideId,
              updated_at: new Date().toISOString()
            })
            .eq('id', groupToUpdate.id);
            
          if (assignError) {
            logger.error(`Error fixing guide consistency for ${fieldName}:`, assignError);
          } else {
            logger.debug(`Fixed guide consistency: Assigned ${fieldName} (${guideId}) to group ${groupToUpdate.id}`);
            
            // Update our local data structure
            tourGroups[availableGroupIndex].guide_id = guideId;
            guideGroupMap[guideId] = groupToUpdate.id;
          }
        }
      }
    }
  } catch (error) {
    logger.error("Error in guide consistency update:", error);
  }
};
