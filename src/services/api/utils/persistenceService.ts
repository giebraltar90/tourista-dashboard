
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
  console.log("persistGuideAssignmentChanges called with:", { 
    tourId, 
    groupId, 
    actualGuideId, 
    groupName,
    groupsCount: updatedGroups?.length || 0
  });
  
  // Validate inputs
  if (!tourId || !groupId) {
    console.error("Cannot persist guide assignment: Missing tour or group ID");
    return false;
  }
  
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
        }
        
        // Before sending to database, set guide_id field for database column
        sanitizedGroup.guide_id = sanitizedGroup.guideId;
        
        // CRITICAL: Make sure participants array is preserved
        if (!sanitizedGroup.participants) {
          sanitizedGroup.participants = [];
        }
        
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
