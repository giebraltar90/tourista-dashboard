
import { toast } from "sonner";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";

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
  logger.debug("BUGFIX: persistGuideAssignmentChanges called with:", { 
    tourId, 
    groupId, 
    actualGuideId, 
    groupName,
    groupsCount: updatedGroups?.length || 0,
    updatedGroupDetails: updatedGroups.map(g => ({
      id: g.id,
      name: g.name,
      hasParticipantsArray: Array.isArray(g.participants),
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0,
      size: g.size,
      childCount: g.childCount
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
    details: participantsToPreserve
  });
  
  // Direct update approach - most reliable
  try {
    // Make a direct update to the table without triggering the materialized view refresh
    const { supabase } = await import("@/integrations/supabase/client");
    
    logger.debug(`Direct update for group ${groupId} with guide ${actualGuideId || 'null'}`);
    
    const updateData = {
      guide_id: actualGuideId,
      name: groupName,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId);
      
    if (!error) {
      logger.debug("Successfully updated guide assignment with direct query");
      updateSuccess = true;
      return true;
    } else if (error.message.includes('materialized view')) {
      // Try alternative approach for permission issues
      logger.debug("Permission issue detected, trying alternative approach");
      
      // Use a simple update query with a different client
      try {
        const { error: directError } = await supabase
          .from('tour_groups')
          .update({
            guide_id: actualGuideId,
            name: groupName,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId)
          .select();
          
        if (!directError) {
          logger.debug("Alternative update successful");
          updateSuccess = true;
          return true;
        } else {
          logger.error("Alternative update failed:", directError);
        }
      } catch (alternativeError) {
        logger.error("Error with alternative update:", alternativeError);
      }
    } else {
      logger.error("Error updating via direct query:", error);
    }
  } catch (error) {
    logger.error("Error with direct database update:", error);
  }
  
  // If direct update failed, try the library function
  if (!updateSuccess) {
    try {
      updateSuccess = await updateGuideInSupabase(
        tourId, 
        groupId, 
        actualGuideId, 
        groupName
      );
      
      logger.debug(`Guide service update result: ${updateSuccess ? 'Success' : 'Failed'}`);
      
      if (updateSuccess) return true;
    } catch (error) {
      logger.error("Error with updateGuideInSupabase:", error);
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
        sanitizedGroup.guide_id = sanitizedGroup.guideId;
        
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
            calculatedSize += participant.count || 1;
            calculatedChildCount += participant.childCount || 0;
          }
          
          // CRITICAL FIX: Always set size and childCount based on participants count
          sanitizedGroup.size = calculatedSize;
          sanitizedGroup.childCount = calculatedChildCount;
        }
        
        return sanitizedGroup;
      });
      
      updateSuccess = await updateTourGroups(tourId, sanitizedGroups);
      logger.debug(`Full groups update result: ${updateSuccess ? 'Success' : 'Failed'}`);
    } catch (error) {
      logger.error("Error with updateTourGroups API:", error);
    }
  }
  
  return updateSuccess;
};
