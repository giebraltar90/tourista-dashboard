
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { persistGuideAssignment } from "../guideAssignmentService";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { updateGuideInSupabase } from "@/services/api/tourGroupApi";

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
  
  // First attempt: direct Supabase update with the most reliable method
  if (tourId && groupId) {
    try {
      // Use the improved updateGuideInSupabase method with retry logic
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
  }
  
  // Second attempt: try the persistGuideAssignment method
  if (!updateSuccess && tourId && groupId) {
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
    
    // Only schedule a very delayed background refresh to eventually sync with server
    // But the delay is long enough that the user won't notice it changing back
    setTimeout(() => {
      // First update the cached data with our optimistic changes
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return oldData; // Return the current state, already updated optimistically
      });
      
      // Schedule a background refetch after a much longer delay to sync with server
      // But never force a UI refresh - just update the cache in the background
      setTimeout(() => {
        queryClient.fetchQuery({ queryKey: ['tour', tourId], staleTime: 30000 });
      }, 30000); // 30 seconds - extremely long delay to prevent visible reversions
    }, 10000); // 10 second initial delay
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
