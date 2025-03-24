
import { toast } from "sonner";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Attempts to persist guide assignment changes through multiple strategies
 */
export const persistGuideAssignmentChanges = async (
  tourId: string,
  groupId: string,
  actualGuideId: string | undefined,
  groupName: string,
  updatedGroups: any[]
): Promise<boolean> => {
  // Track if any persistence method succeeded
  let updateSuccess = false;
  
  // Log all parameters for debugging
  logger.debug("persistGuideAssignmentChanges called with:", { 
    tourId, 
    groupId, 
    actualGuideId, 
    groupName,
    groupsCount: updatedGroups?.length || 0,
    groupsData: updatedGroups.map(g => ({
      id: g.id,
      name: g.name,
      hasGuide: !!g.guideId || !!g.guide_id
    }))
  });
  
  // Validate inputs
  if (!tourId || !groupId) {
    logger.error("Cannot persist guide assignment: Missing tour or group ID");
    return false;
  }
  
  // Find the target group in the updated groups
  const targetGroup = updatedGroups.find(group => group.id === groupId);
  if (!targetGroup) {
    logger.error(`Cannot find target group with ID ${groupId} in updatedGroups`);
    return false;
  }
  
  // BUGFIX: Extract participants from the target group for preservation
  const participantsToPreserve = Array.isArray(targetGroup.participants) 
    ? targetGroup.participants 
    : [];
    
  logger.debug("BUGFIX: Participants to preserve:", {
    groupId,
    count: participantsToPreserve.length,
    details: participantsToPreserve.slice(0, 3) // Log just first 3 for brevity
  });
  
  // IMPORTANT: Pass the guide ID directly without sanitization
  // This is critical to ensure database consistency
  logger.debug(`Persisting guide assignment: ${actualGuideId} for group ${groupId} in tour ${tourId}`);
  
  // First attempt: direct Supabase update with the most reliable method
  try {
    // Pass the guide ID directly without modification
    updateSuccess = await updateGuideInSupabase(
      tourId, 
      groupId, 
      actualGuideId, 
      groupName
    );
    
    logger.debug(`Direct Supabase update result: ${updateSuccess ? 'Success' : 'Failed'}`);
    
    // If the direct update succeeded, we're done
    if (updateSuccess) {
      return true;
    }
  } catch (error) {
    logger.error("Error with direct Supabase update:", error);
  }
  
  // Second attempt: try direct Supabase update with retry logic
  if (!updateSuccess) {
    try {
      // Implement retry logic manually
      const maxRetries = 3;
      let attempt = 0;
      
      while (attempt < maxRetries && !updateSuccess) {
        try {
          logger.debug(`Trying direct database update for group ${groupId} (attempt ${attempt + 1}/${maxRetries})`);
          
          const { error } = await supabase
            .from('tour_groups')
            .update({
              guide_id: actualGuideId,
              name: groupName,
              updated_at: new Date().toISOString()
            })
            .eq('id', groupId)
            .eq('tour_id', tourId);
            
          if (!error) {
            logger.debug(`Successfully updated guide assignment with direct query (attempt ${attempt + 1})`);
            updateSuccess = true;
            
            // After successful update, also update the tours table if needed
            try {
              if (actualGuideId) {
                // Get all guides for this tour
                const { data: tourData } = await supabase
                  .from('tours')
                  .select('guide1_id, guide2_id, guide3_id')
                  .eq('id', tourId)
                  .maybeSingle();
                  
                if (tourData) {
                  // If this guide is not already one of the tour's guides, add it
                  if (tourData.guide1_id !== actualGuideId && 
                      tourData.guide2_id !== actualGuideId && 
                      tourData.guide3_id !== actualGuideId) {
                    // Find the first empty guide slot and fill it
                    let updateField = null;
                    if (!tourData.guide1_id) updateField = 'guide1_id';
                    else if (!tourData.guide2_id) updateField = 'guide2_id';
                    else if (!tourData.guide3_id) updateField = 'guide3_id';
                    
                    if (updateField) {
                      const tourUpdateData: Record<string, any> = {};
                      tourUpdateData[updateField] = actualGuideId;
                      
                      await supabase
                        .from('tours')
                        .update(tourUpdateData)
                        .eq('id', tourId);
                    }
                  }
                }
              }
            } catch (err) {
              logger.error("Error syncing guide to tours table:", err);
              // Don't fail the overall operation for this secondary update
            }
            
            return true;
          } else {
            logger.error(`Error updating via direct query (attempt ${attempt + 1}/${maxRetries}):`, error);
            
            // Try a more targeted update with fewer fields
            if (attempt === 0) {
              const { error: fieldReducedError } = await supabase
                .from('tour_groups')
                .update({
                  guide_id: actualGuideId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', groupId);
                
              if (!fieldReducedError) {
                logger.debug("Successfully updated guide_id with reduced fields");
                updateSuccess = true;
                return true;
              }
            }
          }
        } catch (error) {
          logger.error(`Error with direct database update (attempt ${attempt + 1}/${maxRetries}):`, error);
        }
        
        // Increment attempt and add delay if we're going to retry
        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.min(500 * Math.pow(2, attempt), 3000); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      logger.error("Unexpected error in direct database update:", error);
    }
  }
  
  // Third attempt: if all direct updates failed, try updating all groups at once
  if (!updateSuccess) {
    logger.debug("Falling back to updateTourGroups API as last resort");
    try {
      // Prepare tour groups for database update
      const sanitizedGroups = updatedGroups.map(group => {
        // Create a deep copy to avoid mutating the original
        const sanitizedGroup = JSON.parse(JSON.stringify(group));
        
        // If this is the group we're updating, ensure it has the new guide ID
        if (sanitizedGroup.id === groupId) {
          sanitizedGroup.guideId = actualGuideId;
          sanitizedGroup.name = groupName;
          
          // CRITICAL FIX: Ensure the group maintains its original participants
          if (!Array.isArray(sanitizedGroup.participants) || sanitizedGroup.participants.length === 0) {
            sanitizedGroup.participants = JSON.parse(JSON.stringify(participantsToPreserve));
            logger.debug(`BUGFIX: Restoring ${participantsToPreserve.length} participants to group ${groupId}`);
          }
        }
        
        // Before sending to database, set guide_id field for database column
        sanitizedGroup.guide_id = sanitizedGroup.guideId || sanitizedGroup.guide_id;
        
        // BUGFIX: Make sure participants array is preserved for all groups
        if (!Array.isArray(sanitizedGroup.participants)) {
          sanitizedGroup.participants = [];
        }
        
        // BUGFIX: Ensure size and childCount are consistent with participants array
        if (Array.isArray(sanitizedGroup.participants) && sanitizedGroup.participants.length > 0) {
          // Count each participant directly for accurate totals
          let calculatedSize = 0;
          let calculatedChildCount = 0;
          
          for (const participant of sanitizedGroup.participants) {
            calculatedSize += parseInt(participant.count || '1', 10);
            calculatedChildCount += parseInt(participant.childCount || '0', 10);
          }
          
          // CRITICAL FIX: Always set size and childCount based on participants count
          sanitizedGroup.size = calculatedSize || sanitizedGroup.size;
          sanitizedGroup.childCount = calculatedChildCount || sanitizedGroup.childCount;
        }
        
        return sanitizedGroup;
      });
      
      updateSuccess = await updateTourGroups(tourId, sanitizedGroups);
      logger.debug(`Full groups update result: ${updateSuccess ? 'Success' : 'Failed'}`);
      
      if (updateSuccess) {
        // After successful update, also update the tours table if needed
        try {
          if (actualGuideId) {
            // Get current tour data
            const { data: tourData } = await supabase
              .from('tours')
              .select('guide1_id, guide2_id, guide3_id')
              .eq('id', tourId)
              .maybeSingle();
              
            if (tourData) {
              // If this guide is not already one of the tour's guides, add it
              if (tourData.guide1_id !== actualGuideId && 
                  tourData.guide2_id !== actualGuideId && 
                  tourData.guide3_id !== actualGuideId) {
                // Find the first empty guide slot and fill it
                let updateField = null;
                if (!tourData.guide1_id) updateField = 'guide1_id';
                else if (!tourData.guide2_id) updateField = 'guide2_id';
                else if (!tourData.guide3_id) updateField = 'guide3_id';
                
                if (updateField) {
                  const tourUpdateData: Record<string, any> = {};
                  tourUpdateData[updateField] = actualGuideId;
                  
                  await supabase
                    .from('tours')
                    .update(tourUpdateData)
                    .eq('id', tourId);
                }
              }
            }
          }
        } catch (err) {
          logger.error("Error syncing guide to tours table after group update:", err);
        }
      }
    } catch (error) {
      logger.error("Error with updateTourGroups API:", error);
    }
  }
  
  return updateSuccess;
};
