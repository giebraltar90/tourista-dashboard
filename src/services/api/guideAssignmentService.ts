
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { isValidUuid } from "./utils/guidesUtils";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Updates a guide's assignment to a group in Supabase and synchronizes with tours table
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

    // Log the actual data being sent to the database
    logger.debug("Sending to database:", updateData);

    // Use retry mechanism for reliable database updates
    const { error } = await supabaseWithRetry(async () => {
      return await supabase
        .from('tour_groups')
        .update(updateData)
        .eq('id', groupId)
        .eq('tour_id', tourId);
    });
      
    if (error) {
      logger.error("Error updating guide assignment:", error);
      return false;
    }
    
    // Now also update the guide assignment in the tours table if needed
    if (guideId && guideId !== "_none") {
      let tourUpdateSuccess = false;
      
      // Determine which guide field we're updating (guide1_id, guide2_id, guide3_id)
      if (guideId.startsWith("guide")) {
        const guideField = `${guideId}_id`;
        
        if (guideField === 'guide1_id' || guideField === 'guide2_id' || guideField === 'guide3_id') {
          const updateObj: any = {};
          updateObj[guideField] = isValidUuid(guideId) ? guideId : null;
          
          // Update tours table with retry
          const { error: tourUpdateError } = await supabaseWithRetry(async () => {
            return await supabase
              .from('tours')
              .update(updateObj)
              .eq('id', tourId);
          });
          
          if (tourUpdateError) {
            logger.error(`Error updating ${guideField} in tours table:`, tourUpdateError);
          } else {
            logger.debug(`Successfully updated ${guideField} in tours table`);
            tourUpdateSuccess = true;
          }
        }
      }
      
      // If we failed to update the tours table directly, try an alternative approach
      if (!tourUpdateSuccess) {
        try {
          // Get current tour data
          const { data: tourData } = await supabase
            .from('tours')
            .select('guide1_id, guide2_id, guide3_id')
            .eq('id', tourId)
            .single();
            
          if (tourData) {
            // Check if any of the guides matches our guide ID
            const guideSlot = guideId.startsWith('guide') ? guideId : 
              (tourData.guide1_id === guideId ? 'guide1' :
               tourData.guide2_id === guideId ? 'guide2' :
               tourData.guide3_id === guideId ? 'guide3' : null);
               
            if (guideSlot) {
              const updateField = `${guideSlot}_id`;
              const updateObject: any = {};
              updateObject[updateField] = guideId;
              
              const { error: updateError } = await supabase
                .from('tours')
                .update(updateObject)
                .eq('id', tourId);
                
              if (!updateError) {
                logger.debug(`Successfully updated ${updateField} in tours table`);
              }
            }
          }
        } catch (err) {
          logger.error("Error in alternative tour update strategy:", err);
        }
      }
    }
    
    // Emit event to notify other components about the guide change
    EventEmitter.emit(`guide-change:${tourId}`);
    
    logger.debug("Successfully updated guide assignment in Supabase");
    return true;
  } catch (error) {
    logger.error("Error updating guide assignment:", error);
    return false;
  }
};

/**
 * Fully updates the guide references in tours table
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
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      logger.debug("No guide data to update");
      return true;
    }
    
    // Use retry mechanism for better reliability
    const { error } = await supabaseWithRetry(async () => {
      return await supabase
        .from('tours')
        .update(updateData)
        .eq('id', tourId);
    });
      
    if (error) {
      logger.error("Error updating tour guides:", error);
      return false;
    }
    
    // Emit event to notify other components about the guide change
    EventEmitter.emit(`guide-change:${tourId}`);
    
    logger.debug("Successfully updated all guides for tour");
    return true;
  } catch (error) {
    logger.error("Error updating tour guides:", error);
    return false;
  }
};

/**
 * Synchronizes guide assignments between tour_groups and tours tables
 * to ensure consistency across the application
 */
export const syncGuideAssignmentsAcrossTables = async (tourId: string): Promise<boolean> => {
  if (!tourId) return false;
  
  try {
    logger.debug(`Synchronizing guide assignments for tour ${tourId}`);
    
    // Get tour data
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id, guide1_id, guide2_id, guide3_id')
      .eq('id', tourId)
      .single();
      
    if (tourError || !tourData) {
      logger.error("Error fetching tour data for sync:", tourError);
      return false;
    }
    
    // Get all groups for this tour
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError || !groups) {
      logger.error("Error fetching tour groups for sync:", groupsError);
      return false;
    }
    
    // Check for inconsistencies and fix them
    let changesNeeded = false;
    const groupUpdates = [];
    
    for (const group of groups) {
      // If a group has a guide ID that matches a special guide ID (guide1, guide2, guide3)
      // but the tour doesn't have this guide, update the tour
      if (group.guide_id && (
          (group.guide_id === 'guide1' && !tourData.guide1_id) ||
          (group.guide_id === 'guide2' && !tourData.guide2_id) ||
          (group.guide_id === 'guide3' && !tourData.guide3_id)
      )) {
        changesNeeded = true;
        const guideField = `${group.guide_id}_id`;
        const updateObj: any = {};
        updateObj[guideField] = group.guide_id;
        
        // Update tour with the guide ID from the group
        await supabase
          .from('tours')
          .update(updateObj)
          .eq('id', tourId);
          
        logger.debug(`Updated tour ${tourId} with ${guideField} from group ${group.id}`);
      }
    }
    
    // If we made any changes, emit guide change event
    if (changesNeeded) {
      EventEmitter.emit(`guide-change:${tourId}`);
    }
    
    return true;
  } catch (error) {
    logger.error("Error synchronizing guide assignments:", error);
    return false;
  }
};
