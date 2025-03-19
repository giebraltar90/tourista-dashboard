
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { persistGuideAssignment } from "../guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";

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
  
  // First attempt: direct database update if we have a valid group ID
  if (tourId && groupId) {
    try {
      updateSuccess = await persistGuideAssignment(
        tourId, 
        groupId, 
        actualGuideId, 
        groupName
      );
      
      console.log(`Direct persistence result: ${updateSuccess ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error("Error with direct persistence:", error);
    }
  }
  
  // Second attempt: if direct update failed, try updating all groups at once
  if (!updateSuccess) {
    console.log("Falling back to updateTourGroups API");
    try {
      updateSuccess = await updateTourGroups(tourId, updatedGroups);
      console.log(`Full groups update result: ${updateSuccess ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error("Error with updateTourGroups API:", error);
    }
  }
  
  return updateSuccess;
};

/**
 * Updates the UI with optimistic updates and handles success/failure messaging
 * This now avoids immediate query invalidation which was causing the reversion
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
    
    // Only schedule a background refresh, but don't invalidate immediately
    // This prevents the UI from reverting while still ensuring data consistency
    setTimeout(() => {
      // Use setQueryData instead of invalidating to avoid losing optimistic updates
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return oldData; // Return the current state, already updated optimistically
      });
      
      // Schedule a background refetch after a longer delay to sync with server
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 10000); // 10 seconds - much longer delay to prevent immediate reversions
    }, 5000); // 5 second delay
  } else {
    toast.error("Could not save guide assignment");
  }
};

/**
 * Performs optimistic UI update - improved to do a proper deep clone 
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
    newData.tourGroups = updatedGroups;
    
    return newData;
  });
};
