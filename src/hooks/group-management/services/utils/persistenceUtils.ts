
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
    
    // Force a refresh after a delay to ensure data is fresh
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    }, 1000);
  } else {
    toast.error("Could not save guide assignment");
  }
};

/**
 * Performs optimistic UI update
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    const newData = JSON.parse(JSON.stringify(oldData));
    newData.tourGroups = updatedGroups;
    return newData;
  });
};
