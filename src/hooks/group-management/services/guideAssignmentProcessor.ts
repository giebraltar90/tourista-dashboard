
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GuideInfo } from "@/types/ventrata";
import { prepareGroupUpdate } from "./guideAssignmentService";
import { validateGuideAssignmentInputs } from "./utils/validationUtils";
import { 
  persistGuideAssignmentChanges, 
  performOptimisticUpdate,
  handleUIUpdates 
} from "./utils/persistenceUtils";
import { getGuideNameForAssignment } from "./utils/guideNameUtils";

/**
 * Process guide assignment and update appropriate data stores
 */
export const processGuideAssignment = async (
  tourId: string,
  groupIndex: number,
  currentTour: any,
  guides: GuideInfo[],
  guideId: string | undefined,
  queryClient: QueryClient
): Promise<{
  success: boolean; 
  updatedGroups: any; 
  guideName: string; 
  groupName: string;
}> => {
  try {
    console.log("Assigning guide to group:", { groupIndex, guideId, tourId });
    
    // If guideId is "_none", treat it as undefined to unassign the guide
    const actualGuideId = guideId === "_none" ? undefined : guideId;
    
    // Create a deep copy of tourGroups to avoid mutation issues
    const updatedTourGroups = Array.isArray(currentTour.tourGroups) ? 
      JSON.parse(JSON.stringify(currentTour.tourGroups)) : [];
    
    // Validate inputs
    const validation = validateGuideAssignmentInputs(
      tourId, 
      groupIndex, 
      currentTour, 
      updatedTourGroups
    );
    
    if (!validation.isValid) {
      console.error("Guide assignment validation failed:", validation);
      return {
        success: false,
        updatedGroups: updatedTourGroups,
        guideName: "Error",
        groupName: "Unknown Group"
      };
    }
    
    const { groupId, groupName } = validation;
    
    // Get the current group name and guide ID for comparison
    const currentGuideId = updatedTourGroups[groupIndex].guideId;
    
    // Skip processing if nothing changes
    if (currentGuideId === actualGuideId) {
      console.log("No change in guide assignment, skipping update");
      return {
        success: true,
        updatedGroups: updatedTourGroups,
        guideName: "Unchanged",
        groupName: updatedTourGroups[groupIndex].name || ""
      };
    }
    
    // Find guide name for the modification description
    let guideName = getGuideNameForAssignment(actualGuideId, currentTour, guides);
    
    // Special handling for special guide IDs to use actual names
    if (actualGuideId === "guide1" && currentTour.guide1) {
      guideName = currentTour.guide1;
    } else if (actualGuideId === "guide2" && currentTour.guide2) {
      guideName = currentTour.guide2;
    } else if (actualGuideId === "guide3" && currentTour.guide3) {
      guideName = currentTour.guide3;
    }
    
    // Update the group with new guide ID and possibly new name
    const groupsWithUpdates = prepareGroupUpdate(
      updatedTourGroups,
      groupIndex,
      actualGuideId,
      guideName
    );

    console.log("Updated tour groups:", groupsWithUpdates);
    
    // Apply optimistic update to UI immediately
    performOptimisticUpdate(queryClient, tourId, groupsWithUpdates);
    
    // Persist changes to the database
    const updateSuccess = await persistGuideAssignmentChanges(
      tourId,
      groupId as string,
      actualGuideId,
      groupsWithUpdates[groupIndex].name,
      groupsWithUpdates
    );
    
    // Handle UI updates based on success/failure
    await handleUIUpdates(tourId, queryClient, actualGuideId, guideName, updateSuccess);
    
    return {
      success: updateSuccess,
      updatedGroups: groupsWithUpdates,
      guideName,
      groupName: groupsWithUpdates[groupIndex].name || ""
    };
    
  } catch (error) {
    console.error("Error processing guide assignment:", error);
    toast.error("Failed to assign guide to group");
    throw error;
  }
};
