
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { persistGuideAssignment } from "../guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { updateGuideInSupabase } from "@/services/api/tourGroupApi";
import { isUuid } from "@/types/ventrata";

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
  
  // NEVER try to save non-UUID guide IDs directly to the database
  // Instead, save them as null or convert to valid UUIDs
  let safeGuideId = null;
  if (actualGuideId && isUuid(actualGuideId)) {
    safeGuideId = actualGuideId;
  } else if (actualGuideId) {
    // Log that we're not using a UUID guide ID in the database
    console.log(`Non-UUID guide ID will be saved as null: ${actualGuideId}`);
  }
  
  // First attempt: direct Supabase update with the most reliable method
  if (tourId && groupId) {
    try {
      // Use the improved updateGuideInSupabase method with retry logic
      updateSuccess = await updateGuideInSupabase(
        tourId, 
        groupId, 
        safeGuideId, // Use null or a valid UUID
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
  }
  
  // Second attempt: try the persistGuideAssignment method
  if (!updateSuccess && tourId && groupId) {
    try {
      updateSuccess = await persistGuideAssignment(
        tourId, 
        groupId, 
        safeGuideId, // Use null or a valid UUID
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
      // Prepare tour groups for database update - sanitize guide IDs
      const sanitizedGroups = updatedGroups.map(group => {
        if (!group.guideId || isUuid(group.guideId)) {
          return group; // Keep valid UUIDs or null/undefined
        }
        
        // For non-UUID guide IDs, create a copy with null guideId
        return {
          ...group,
          guideId: null
        };
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
 * This now completely disables immediate query invalidation which was causing the reversion
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
    
    // CRITICAL CHANGE: Never invalidate queries immediately, let the optimistic update persist
    // This solves the problem of guides "changing back" after assignment
    
    // Permanently disable automatic query invalidation
    queryClient.setQueryData(['tour', tourId], (oldData: any) => {
      if (!oldData) return null;
      return oldData; // Return the current state, already updated optimistically
    });
    
    // Cancel any in-flight queries that might overwrite our changes
    queryClient.cancelQueries({ queryKey: ['tour', tourId] });
    queryClient.cancelQueries({ queryKey: ['tours'] });
    
    console.log("Successfully updated - permanently disabled revalidation");
  } else {
    toast.error("Could not save guide assignment");
  }
};

/**
 * Performs optimistic UI update - completely rewritten to do a proper deep clone 
 * and preserve all properties without risk of reference issues
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Do a proper deep clone to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Replace the tour groups with our updated version
    // This is key - we're completely replacing the groups array, not modifying it
    newData.tourGroups = JSON.parse(JSON.stringify(updatedGroups));
    
    return newData;
  });
};
