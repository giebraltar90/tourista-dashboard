
import { VentrataTourGroup } from "@/types/ventrata";
import { isUuid } from "@/types/ventrata";
import { findGuideName } from "../utils/guideNameUtils";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { GuideInfo } from "@/types/ventrata";
import { updateGuideInSupabase, updateTourGroups } from "@/services/api/tourGroupApi";

/**
 * Prepare updated groups with new guide assignment
 */
export const prepareGroupUpdate = (
  tourGroups: VentrataTourGroup[],
  groupIndex: number,
  guideId?: string,
  guideName?: string
) => {
  // Create a deep copy of tourGroups to avoid mutation issues
  const updatedTourGroups = JSON.parse(JSON.stringify(tourGroups));
  
  // Update the guide ID for the specified group
  updatedTourGroups[groupIndex].guideId = guideId;
  
  // Optionally update the group name if a guide name is provided
  if (guideName && guideName !== "Unassigned") {
    // Only update name if it's not already customized
    if (!updatedTourGroups[groupIndex].name || 
        updatedTourGroups[groupIndex].name === `Group ${groupIndex + 1}`) {
      updatedTourGroups[groupIndex].name = `${guideName}'s Group`;
    }
  }
  
  return updatedTourGroups;
};

/**
 * Process guide assignment and update appropriate data stores
 */
export const processGuideAssignment = async (
  tourId: string,
  groupIndex: number,
  currentTour: any,
  guides: GuideInfo[],
  guideId?: string,
  queryClient: QueryClient
) => {
  try {
    if (!currentTour) throw new Error("Tour not found");
    
    console.log("Assigning guide to group:", { groupIndex, guideId, tourId });
    
    // If guideId is "_none", treat it as undefined to unassign the guide
    const actualGuideId = guideId === "_none" ? undefined : guideId;
    
    // Create a deep copy of tourGroups to avoid mutation issues
    const updatedTourGroups = JSON.parse(JSON.stringify(currentTour.tourGroups));
    
    // Get the current group name and guide ID for comparison
    const currentGuideId = updatedTourGroups[groupIndex].guideId;
    
    // Skip processing if nothing changes
    if (currentGuideId === actualGuideId) {
      console.log("No change in guide assignment, skipping update");
      return true;
    }
    
    // Find guide name for the modification description
    const guideName = actualGuideId ? findGuideName(actualGuideId, currentTour, guides) : "Unassigned";
    
    // Update the group with new guide ID and possibly new name
    const groupsWithUpdates = prepareGroupUpdate(
      updatedTourGroups,
      groupIndex,
      actualGuideId,
      guideName
    );

    console.log("Updated tour groups:", groupsWithUpdates);
    
    // CRITICAL: Immediately update local cache BEFORE API call
    queryClient.setQueryData(['tour', tourId], {
      ...currentTour,
      tourGroups: groupsWithUpdates
    });
    
    // Check if this is a UUID tour ID for direct database updates
    const tourIsUuid = isUuid(tourId);
    
    // Track if any persistence method succeeded
    let updateSuccess = false;
    
    // First, directly try to update the specific group in Supabase if it's a UUID tour
    if (tourIsUuid) {
      const groupId = updatedTourGroups[groupIndex].id;
      
      if (groupId) {
        const newGroupName = updatedTourGroups[groupIndex].name;
        updateSuccess = await updateGuideInSupabase(tourId, groupId, actualGuideId, newGroupName);
      }
    }
    
    // If direct update failed or it's not a UUID tour, try the updateTourGroups API function
    if (!updateSuccess) {
      console.log("Falling back to updateTourGroups API");
      updateSuccess = await updateTourGroups(tourId, updatedTourGroups);
    }
    
    // Show success/error messages
    if (updateSuccess) {
      // Show a success message with proper guide name
      if (actualGuideId) {
        toast.success(`Guide ${guideName} assigned to group successfully`);
      } else {
        toast.success("Guide removed from group");
      }
    } else {
      toast.error("Could not persist guide assignment");
    }
    
    return {
      success: updateSuccess,
      updatedGroups: groupsWithUpdates,
      guideName,
      groupName: updatedTourGroups[groupIndex].name
    };
    
  } catch (error) {
    console.error("Error processing guide assignment:", error);
    toast.error("Failed to assign guide to group");
    throw error;
  }
};
