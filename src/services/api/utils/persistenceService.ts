import { toast } from "sonner";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
  console.log("BUGFIX: persistGuideAssignmentChanges called with:", { 
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
    console.error("Cannot persist guide assignment: Missing tour or group ID");
    return false;
  }
  
  // Find the target group in the updated groups
  const targetGroup = updatedGroups.find(group => group.id === groupId);
  if (!targetGroup) {
    console.error(`Cannot find target group with ID ${groupId} in updatedGroups`);
    return false;
  }
  
  // BUGFIX: Extract participants from the target group for preservation
  const participantsToPreserve = Array.isArray(targetGroup.participants) 
    ? targetGroup.participants 
    : [];
    
  console.log("BUGFIX: Participants to preserve:", {
    groupId,
    count: participantsToPreserve.length,
    details: participantsToPreserve
  });
  
  // IMPORTANT: Pass the guide ID directly without sanitization
  // This is critical to ensure database consistency
  console.log(`Persisting guide assignment: ${actualGuideId} for group ${groupId} in tour ${tourId}`);
  
  // First attempt: direct Supabase update with the most reliable method
  try {
    // Pass the guide ID directly without modification
    updateSuccess = await updateGuideInSupabase(
      tourId, 
      groupId, 
      actualGuideId, 
      groupName
    );
    
    console.log(`Direct Supabase update result: ${updateSuccess ? 'Success' : 'Failed'}`);
    
    // If the direct update succeeded, we're done
    if (updateSuccess) {
      return true;
    }
  } catch (error) {
    console.error("Error with direct Supabase update:", error);
  }
  
  // Second attempt: try direct Supabase update without using a helper function
  if (!updateSuccess) {
    try {
      // Import and use supabase client directly for this attempt
      const { supabase } = await import("@/integrations/supabase/client");
      
      console.log(`Trying direct database update for group ${groupId}`);
      
      const { error } = await supabase
        .from('tour_groups')
        .update({
          guide_id: actualGuideId,
          name: groupName
        })
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (!error) {
        console.log("Successfully updated guide assignment with direct query");
        updateSuccess = true;
        return true;
      } else {
        console.error("Error updating via direct query:", error);
      }
    } catch (error) {
      console.error("Error with direct database update:", error);
    }
  }
  
  // Third attempt: if all direct updates failed, try updating all groups at once
  if (!updateSuccess) {
    console.log("Falling back to updateTourGroups API as last resort");
    try {
      // Prepare tour groups for database update
      const sanitizedGroups = updatedGroups.map(group => {
        // Create a deep copy to avoid mutating the original
        const sanitizedGroup = {...group};
        
        // If this is the group we're updating, ensure it has the new guide ID
        if (sanitizedGroup.id === groupId) {
          sanitizedGroup.guideId = actualGuideId;
          sanitizedGroup.name = groupName;
          
          // BUGFIX: Ensure the group maintains its original participants
          if (!Array.isArray(sanitizedGroup.participants) || sanitizedGroup.participants.length === 0) {
            sanitizedGroup.participants = participantsToPreserve;
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
        } else {
          // CRITICAL FIX: If no participants, set size and childCount to 0
          sanitizedGroup.size = 0;
          sanitizedGroup.childCount = 0;
        }
        
        console.log(`BUGFIX: Group ${sanitizedGroup.id} after sanitization:`, {
          name: sanitizedGroup.name,
          participantsCount: Array.isArray(sanitizedGroup.participants) 
            ? sanitizedGroup.participants.length 
            : 0,
          size: sanitizedGroup.size,
          childCount: sanitizedGroup.childCount,
          guideId: sanitizedGroup.guideId,
          guide_id: sanitizedGroup.guide_id
        });
        
        return sanitizedGroup;
      });
      
      updateSuccess = await updateTourGroups(tourId, sanitizedGroups);
      console.log(`Full groups update result: ${updateSuccess ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error("Error with updateTourGroups API:", error);
    }
  }
  
  return updateSuccess;
};
