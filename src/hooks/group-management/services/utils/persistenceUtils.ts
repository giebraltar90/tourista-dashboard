
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { persistGuideAssignment } from "../guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";
import { isValidUuid, mapSpecialGuideIdToUuid } from "@/services/api/utils/guidesUtils";

/**
 * Applies an optimistic update to the UI cache
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a deep copy to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Apply updated groups by matching IDs instead of simple array replacement
    if (Array.isArray(updatedGroups) && Array.isArray(newData.tourGroups)) {
      updatedGroups.forEach(updatedGroup => {
        // Find the matching group by ID and update it
        const groupIndex = newData.tourGroups.findIndex((g: any) => g.id === updatedGroup.id);
        if (groupIndex !== -1) {
          console.log(`Optimistically updating group ${updatedGroup.id} at index ${groupIndex}:`, updatedGroup);
          newData.tourGroups[groupIndex] = updatedGroup;
        }
      });
    }
    
    console.log("Optimistic update applied to tour data:", newData);
    return newData;
  });
};

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
  
  // Second attempt: try the persistGuideAssignment method
  if (!updateSuccess) {
    try {
      updateSuccess = await persistGuideAssignment(
        tourId, 
        groupId, 
        actualGuideId, 
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
      // Prepare tour groups for database update
      const sanitizedGroups = updatedGroups.map(group => {
        // Create a deep copy to avoid mutating the original
        const sanitizedGroup = {...group};
        
        // If this is the group we're updating, ensure it has the new guide ID
        if (sanitizedGroup.id === groupId) {
          sanitizedGroup.guideId = actualGuideId;
        }
        
        // Before sending to database, set guide_id field for database column
        sanitizedGroup.guide_id = sanitizedGroup.guideId;
        
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
      toast.success("Guide removed from group successfully");
    }
  } else {
    toast.error("Failed to update guide assignment on the server");
    
    // Force a fresh refetch to ensure UI is accurate despite the failed update
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
  }
};
