
import { VentrataTourGroup } from "@/types/ventrata";
import { isUuid } from "@/types/ventrata";
import { findGuideName } from "../utils/guideNameUtils";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { GuideInfo } from "@/types/ventrata";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { persistGuideAssignment, prepareGroupUpdate } from "./guideAssignmentService";

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
    if (!currentTour) throw new Error("Tour not found");
    
    console.log("Assigning guide to group:", { groupIndex, guideId, tourId });
    
    // If guideId is "_none", treat it as undefined to unassign the guide
    const actualGuideId = guideId === "_none" ? undefined : guideId;
    
    // Create a deep copy of tourGroups to avoid mutation issues
    const updatedTourGroups = Array.isArray(currentTour.tourGroups) ? 
      JSON.parse(JSON.stringify(currentTour.tourGroups)) : [];
    
    // Check if the group exists at the specified index
    if (!updatedTourGroups[groupIndex]) {
      console.error(`Group at index ${groupIndex} does not exist`);
      return {
        success: false,
        updatedGroups: updatedTourGroups,
        guideName: "Error",
        groupName: "Unknown Group"
      };
    }
    
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
    const guideName = actualGuideId ? findGuideName(
      actualGuideId, 
      currentTour, 
      Array.isArray(guides) ? guides.map(g => ({ id: g.id || "", name: g.name })) : []
    ) : "Unassigned";
    
    // Get current group data
    const currentGroup = updatedTourGroups[groupIndex];
    const groupId = currentGroup?.id;
    const groupName = currentGroup?.name || `Group ${groupIndex + 1}`;
    
    // Update the group with new guide ID and possibly new name
    const groupsWithUpdates = prepareGroupUpdate(
      updatedTourGroups,
      groupIndex,
      actualGuideId,
      guideName
    );

    console.log("Updated tour groups:", groupsWithUpdates);
    
    // Track if any persistence method succeeded
    let updateSuccess = false;
    
    // Apply optimistic update to UI immediately
    queryClient.setQueryData(['tour', tourId], (oldData: any) => {
      if (!oldData) return null;
      const newData = JSON.parse(JSON.stringify(oldData));
      newData.tourGroups = groupsWithUpdates;
      return newData;
    });
    
    // First attempt: direct database update if we have a valid group ID
    if (isUuid(tourId) && groupId) {
      try {
        updateSuccess = await persistGuideAssignment(
          tourId, 
          groupId, 
          actualGuideId, 
          groupsWithUpdates[groupIndex].name
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
        updateSuccess = await updateTourGroups(tourId, groupsWithUpdates);
        console.log(`Full groups update result: ${updateSuccess ? 'Success' : 'Failed'}`);
      } catch (error) {
        console.error("Error with updateTourGroups API:", error);
      }
    }
    
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
