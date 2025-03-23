
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "./utils/guidesUtils";
import { logger } from "@/utils/logger";

/**
 * Updates a guide's assignment to a group in Supabase directly
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

    // Update the guide assignment in the database
    const { error } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId)
      .eq('tour_id', tourId);
      
    if (error) {
      logger.error("Error updating guide assignment:", error);
      return false;
    }
    
    // Now also update the guide assignment in the tours table if needed
    // (This is the fix for the reported issue with guide assignments not being properly saved)
    if (guideId && guideId !== "_none" && guideId.startsWith("guide")) {
      // Determine which guide field we're updating (guide1_id, guide2_id, guide3_id)
      const guideField = `${guideId}_id`.replace('guide', 'guide');
      
      // Call the new function to update the guide in the tours table
      const { error: tourUpdateError } = await supabase.rpc('update_tour_guide_assignment', {
        p_tour_id: tourId,
        p_guide_field: guideField,
        p_guide_id: isValidUuid(guideId) ? guideId : null
      });
      
      if (tourUpdateError) {
        logger.error("Error updating guide in tours table:", tourUpdateError);
        // Not returning false here as the group update succeeded
      } else {
        logger.debug(`Successfully updated ${guideField} in tours table`);
      }
    }
    
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
    
    const { error } = await supabase
      .from('tours')
      .update(updateData)
      .eq('id', tourId);
      
    if (error) {
      logger.error("Error updating tour guides:", error);
      return false;
    }
    
    logger.debug("Successfully updated all guides for tour");
    return true;
  } catch (error) {
    logger.error("Error updating tour guides:", error);
    return false;
  }
};
