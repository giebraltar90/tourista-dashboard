
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { persistGuideAssignment } from "../guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { isValidUuid, sanitizeGuideId } from "@/services/api/utils/guidesUtils";

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
  
  // Determine what to save in the database
  // CRITICAL: Use sanitizeGuideId to ensure proper database storage
  // This handles special IDs like guide1, guide2, guide3 properly
  const safeGuideId = sanitizeGuideId(actualGuideId);
  
  console.log(`Persisting guide assignment: ${actualGuideId} (sanitized: ${safeGuideId}) for group ${groupId} in tour ${tourId}`);
  
  // First attempt: direct Supabase update with the most reliable method
  try {
    // Use the improved updateGuideInSupabase method with retry logic
    updateSuccess = await updateGuideInSupabase(
      tourId, 
      groupId, 
      actualGuideId, // Pass the actual ID - sanitization happens in the function
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
  
  // Second attempt: try the persistGuideAssignment method
  if (!updateSuccess) {
    try {
      updateSuccess = await persistGuideAssignment(
        tourId, 
        groupId, 
        actualGuideId, // Pass the actual ID - sanitization happens in the function
        groupName
      );
      
      console.log(`Direct persistence result: ${updateSuccess ? 'Success' : 'Failed'}`);
      
      // If the persistGuideAssignment succeeded, we're done
      if (updateSuccess) {
        return true;
      }
    } catch (error) {
      console.error("Error with persistGuideAssignment:", error);
    }
  }
  
  // Third attempt: if all direct updates failed, try updating all groups at once
  if (!updateSuccess) {
    console.log("Falling back to updateTourGroups API as last resort");
    try {
      // Prepare tour groups for database update - sanitize all guide IDs
      const sanitizedGroups = updatedGroups.map(group => {
        // Create a deep copy to avoid mutating the original
        const sanitizedGroup = {...group};
        
        // If this is the group we're updating, ensure it has the new guide ID
        if (sanitizedGroup.id === groupId) {
          sanitizedGroup.guideId = actualGuideId;
        }
        
        // Before sending to database, sanitize the guide ID
        sanitizedGroup.guide_id = sanitizeGuideId(sanitizedGroup.guideId);
        
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

/**
 * Updates the UI with optimistic updates and handles success/failure messaging
 */
export const handleUIUpdates = async (
  tourId: string,
  queryClient: QueryClient,
  actualGuideId: string | undefined,
  guideName: string,
  updateSuccess: boolean
): Promise<void> => {
  // Show success/error messages
  if (updateSuccess) {
    // Show a success message with proper guide name
    if (actualGuideId) {
      toast.success(`Guide ${guideName} assigned to group successfully`);
    } else {
      toast.success("Guide removed from group");
    }
    
    // CRITICAL FIX: Cancel all in-flight queries immediately
    // This solves the problem of guides "changing back" after assignment
    queryClient.cancelQueries();
    
    // Invalidate ALL relevant queries after a delay to ensure database consistency
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      
      // Also invalidate the tour cache to ensure it's fully refreshed
      const allToursData = queryClient.getQueryData(['tours']);
      if (allToursData) {
        queryClient.setQueryData(['tours'], allToursData);
      }
    }, 1000);
  } else {
    toast.error("Could not save guide assignment");
  }
};

/**
 * Performs optimistic UI update with proper deep cloning
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  // Do a proper deep clone to avoid reference issues
  const groupsCopy = JSON.parse(JSON.stringify(updatedGroups));
  
  // CRITICAL FIX: Apply the update without overwriting other parts of the data
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Do a proper deep clone to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Replace the tour groups with our updated version
    newData.tourGroups = groupsCopy;
    
    // Check if any of our primary guides changed and sync them
    if (groupsCopy.length > 0) {
      // Update guide1 if Group 0 has a guide assigned
      if (groupsCopy[0]?.guideId) {
        // Find the guide name based on ID 
        const guideName = groupsCopy[0].name.includes(':') ? 
          groupsCopy[0].name.split(':')[1].trim() : undefined;
        
        if (guideName) {
          newData.guide1 = guideName;
        }
      }
      
      // Update guide2 if Group 1 has a guide assigned
      if (groupsCopy.length > 1 && groupsCopy[1]?.guideId) {
        // Find the guide name based on ID
        const guideName = groupsCopy[1].name.includes(':') ? 
          groupsCopy[1].name.split(':')[1].trim() : undefined;
        
        if (guideName) {
          newData.guide2 = guideName;
        }
      }
      
      // Update guide3 if Group 2 has a guide assigned
      if (groupsCopy.length > 2 && groupsCopy[2]?.guideId) {
        // Find the guide name based on ID
        const guideName = groupsCopy[2].name.includes(':') ? 
          groupsCopy[2].name.split(':')[1].trim() : undefined;
        
        if (guideName) {
          newData.guide3 = guideName;
        }
      }
    }
    
    return newData;
  });
};
