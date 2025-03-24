
import { supabase } from "@/integrations/supabase/client";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { logger } from "@/utils/logger";

/**
 * Persists guide assignment changes to the database with retry mechanism
 */
export const persistGuideAssignmentChanges = async (
  tourId: string,
  groupId: string,
  guideId: string | null,
  groupName: string,
  updatedGroups: any[]
): Promise<boolean> => {
  if (!tourId || !groupId) {
    logger.error("Cannot persist guide assignment: Invalid tour or group ID");
    return false;
  }

  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      logger.debug(`Persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        tourId,
        groupId,
        guideId,
        groupName
      });

      // First try the direct updateGuideInSupabase function
      success = await updateGuideInSupabase(tourId, groupId, guideId, groupName);
      
      if (success) {
        logger.debug("Successfully persisted guide assignment using updateGuideInSupabase");
        break;
      }
      
      // If that fails, try a direct Supabase call
      const { error } = await supabase
        .from('tour_groups')
        .update({
          guide_id: guideId,
          name: groupName,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (!error) {
        logger.debug("Successfully persisted guide assignment with direct Supabase call");
        success = true;
        break;
      } else {
        logger.error(`Failed to persist guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Second direct attempt with fewer fields (only guide_id)
        const { error: secondError } = await supabase
          .from('tour_groups')
          .update({
            guide_id: guideId,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId);
          
        if (!secondError) {
          logger.debug("Successfully persisted guide assignment with reduced field update");
          success = true;
          break;
        } else {
          logger.error(`Failed second attempt (${attempt + 1}/${MAX_RETRIES}):`, secondError);
        }
      }
    } catch (error) {
      logger.error(`Error persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
    
    // Increase retry attempt
    attempt++;
    
    // Wait before retrying
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(500 * Math.pow(2, attempt), 3000); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we couldn't save normally, try updating the guides directly in the tours table
  if (!success && guideId && guideId.startsWith('guide')) {
    try {
      const guideNumber = guideId.replace('guide', '');
      if (['1', '2', '3'].includes(guideNumber)) {
        const fieldName = `guide${guideNumber}_id`;
        
        // Get the actual UUID of the guide from our groups data
        const guideUuid = updatedGroups.find(g => g.id === groupId)?.guide_id;
        
        if (guideUuid) {
          const updateData: Record<string, any> = {};
          updateData[fieldName] = guideUuid;
          
          const { error } = await supabase
            .from('tours')
            .update(updateData)
            .eq('id', tourId);
            
          if (!error) {
            logger.debug(`Successfully updated ${fieldName} in tours table`);
            success = true;
          } else {
            logger.error(`Failed to update ${fieldName} in tours table:`, error);
          }
        }
      }
    } catch (err) {
      logger.error("Error updating guide in tours table:", err);
    }
  }

  // Critical - always emit an event to notify that the database operation completed
  if (success) {
    try {
      // Try to update related tour guide fields in the tours table
      await updateTourGuideFieldsFromGroups(tourId);
    } catch (error) {
      logger.error("Failed to update tour guide fields:", error);
      // Don't fail the overall operation for this secondary update
    }
  }

  return success;
};

/**
 * Updates the guide fields in the tours table based on the current group guide assignments
 */
const updateTourGuideFieldsFromGroups = async (tourId: string): Promise<void> => {
  try {
    // Get all groups with guides for this tour
    const { data: groups, error } = await supabase
      .from('tour_groups')
      .select('id, guide_id, name')
      .eq('tour_id', tourId)
      .not('guide_id', 'is', null);
      
    if (error || !groups || groups.length === 0) {
      return;
    }
    
    // Build update data for tours table
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Assign guides to tour fields
    groups.forEach((group, index) => {
      // Limit to first 3 guides
      if (index < 3 && group.guide_id) {
        const fieldName = `guide${index + 1}_id`;
        updateData[fieldName] = group.guide_id;
      }
    });
    
    // Only update if we have guide fields to update
    if (Object.keys(updateData).length > 1) { // More than just updated_at
      await supabase
        .from('tours')
        .update(updateData)
        .eq('id', tourId);
    }
  } catch (error) {
    logger.error("Error syncing guides to tour:", error);
  }
};
