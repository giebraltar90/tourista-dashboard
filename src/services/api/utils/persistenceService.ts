
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
  
  // Extract participants from the target group for preservation
  const participantsToPreserve = Array.isArray(targetGroup.participants) 
    ? targetGroup.participants 
    : [];
    
  logger.debug("BUGFIX: Participants to preserve:", {
    groupId,
    count: participantsToPreserve.length,
    details: participantsToPreserve
  });
  
  // Strategy 1: Use our new safe_update_tour_group RPC function
  try {
    // Fetch current group data to preserve fields
    const { data: groupData, error: fetchError } = await supabase
      .from("tour_groups")
      .select("size, entry_time, child_count")
      .eq("id", groupId)
      .single();
      
    if (!fetchError && groupData) {
      // Use safe update function with all required fields
      const { error: safeUpdateError } = await supabase.rpc(
        'safe_update_tour_group',
        {
          p_id: groupId,
          p_name: groupName,
          p_size: groupData.size || 0,
          p_guide_id: actualGuideId,
          p_entry_time: groupData.entry_time || '00:00',
          p_child_count: groupData.child_count || 0
        }
      );
      
      if (!safeUpdateError) {
        logger.debug("Successfully updated guide via safe_update_tour_group function");
        updateSuccess = true;
        return true;
      }
      
      logger.debug("safe_update_tour_group function failed:", safeUpdateError);
    }
  } catch (safeUpdateError) {
    logger.debug("safe_update_tour_group function not available:", safeUpdateError);
  }
  
  // Strategy 2: Use the assign_guide_safely function
  try {
    const { data, error } = await supabase.rpc(
      'assign_guide_safely',
      {
        p_group_id: groupId,
        p_guide_id: actualGuideId,
        p_group_name: groupName
      }
    );
    
    if (!error) {
      logger.debug("Successfully updated guide via assign_guide_safely function");
      updateSuccess = true;
      return true;
    }
    
    logger.debug("assign_guide_safely function failed:", error);
  } catch (rpcError) {
    logger.debug("assign_guide_safely function not available:", rpcError);
  }
  
  // Strategy 3: Direct update approach - most reliable
  try {
    // Make a direct update to the table without triggering the materialized view refresh
    const { supabase } = await import("@/integrations/supabase/client");
    
    logger.debug(`Direct update for group ${groupId} with guide ${actualGuideId || 'null'}`);
    
    // Try update_group_guide_no_triggers function 
    try {
      const { error: rpcError } = await supabase.rpc(
        'update_group_guide_no_triggers',
        {
          p_group_id: groupId,
          p_guide_id: actualGuideId,
          p_name: groupName
        }
      );
      
      if (!rpcError) {
        logger.debug("Successfully updated guide assignment with RPC function");
        updateSuccess = true;
        return true;
      }
      
      logger.debug("RPC function failed or not available:", rpcError);
    } catch (rpcErr) {
      logger.debug("RPC function not available:", rpcErr);
    }
    
    // Strategy 4: Direct update with select to avoid triggering materialized view refresh
    const updateData = {
      guide_id: actualGuideId,
      name: groupName,
      updated_at: new Date().toISOString()
    };
    
    // Try with separate update for guide_id only
    try {
      const { error: guideError } = await supabase
        .from('tour_groups')
        .update({ guide_id: actualGuideId })
        .eq('id', groupId);
        
      if (!guideError) {
        logger.debug("Successfully updated just the guide_id");
        updateSuccess = true;
        
        // Also try to update the name
        const { error: nameError } = await supabase
          .from('tour_groups')
          .update({ name: groupName })
          .eq('id', groupId);
          
        if (nameError) {
          logger.debug("Could not update name, but guide_id was updated:", nameError);
        }
        
        return true;
      }
    } catch (separateError) {
      logger.debug("Separate update approach failed:", separateError);
    }
    
    // Strategy 5: try standard update with .select()
    const { error } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId)
      .select();
      
    if (!error) {
      logger.debug("Successfully updated guide assignment with direct query + select");
      updateSuccess = true;
      return true;
    } else if (error.message.includes('materialized view')) {
      // Try alternative approach for permission issues
      logger.debug("Permission issue detected, trying alternative approach");
      
      // Strategy 6: Use a simple update query without .select()
      try {
        const { error: directError } = await supabase
          .from('tour_groups')
          .update({
            guide_id: actualGuideId,
            name: groupName,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId);
          
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
  
  // Last attempt: if all direct updates failed, try updating all groups at once
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
          sanitizedGroup.guide_id = actualGuideId;
          sanitizedGroup.name = groupName;
          
          // CRITICAL FIX: Ensure the group maintains its original participants
          if (!Array.isArray(sanitizedGroup.participants) || sanitizedGroup.participants.length === 0) {
            sanitizedGroup.participants = JSON.parse(JSON.stringify(participantsToPreserve));
            logger.debug(`BUGFIX: Restoring ${participantsToPreserve.length} participants to group ${groupId}`);
          }
        }
        
        // Before sending to database, set guide_id field for database column
        sanitizedGroup.guide_id = sanitizedGroup.guideId;
        
        // Make sure participants array is preserved for all groups
        if (!Array.isArray(sanitizedGroup.participants)) {
          sanitizedGroup.participants = [];
        }
        
        // Ensure size and childCount are consistent with participants array
        if (Array.isArray(sanitizedGroup.participants) && sanitizedGroup.participants.length > 0) {
          // Count each participant directly for accurate totals
          let calculatedSize = 0;
          let calculatedChildCount = 0;
          
          for (const participant of sanitizedGroup.participants) {
            calculatedSize += participant.count || 1;
            calculatedChildCount += participant.childCount || 0;
          }
          
          // Always set size and childCount based on participants count
          sanitizedGroup.size = calculatedSize || 0;
          sanitizedGroup.childCount = calculatedChildCount || 0;
        }
        
        // Ensure size is never null (causes database errors)
        if (sanitizedGroup.size === null || sanitizedGroup.size === undefined) {
          sanitizedGroup.size = 0;
        }
        
        // Ensure child_count is never null
        if (sanitizedGroup.childCount === null || sanitizedGroup.childCount === undefined) {
          sanitizedGroup.childCount = 0;
        }
        if (sanitizedGroup.child_count === null || sanitizedGroup.child_count === undefined) {
          sanitizedGroup.child_count = 0;
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

// Helper function to get the Supabase client
let supabase: any;
async function getSupabase() {
  if (!supabase) {
    const { supabase: client } = await import("@/integrations/supabase/client");
    supabase = client;
  }
  return supabase;
}
