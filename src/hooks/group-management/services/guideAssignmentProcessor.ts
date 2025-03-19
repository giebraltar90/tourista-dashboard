
import { VentrataTourGroup } from "@/types/ventrata";
import { isUuid } from "@/types/ventrata";
import { findGuideName } from "../utils/guideNameUtils";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import { GuideInfo } from "@/types/ventrata";
import { updateGuideInSupabase, updateTourGroups } from "@/services/api/tourGroupApi";
import { persistGuideAssignment } from "./guideAssignmentService";

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
  
  // Ensure the group at the specified index exists
  if (!updatedTourGroups[groupIndex]) {
    console.error(`Group at index ${groupIndex} does not exist`);
    return updatedTourGroups;
  }
  
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
    
    // Get the group ID for the direct update
    const groupId = updatedTourGroups[groupIndex]?.id;
    
    // CRITICAL FIX: Immediately update local cache BEFORE API call using deep clone
    queryClient.setQueryData(['tour', tourId], (oldData: any) => {
      if (!oldData) return null;
      const newData = JSON.parse(JSON.stringify(oldData));
      newData.tourGroups = groupsWithUpdates;
      return newData;
    });
    
    // First, directly try to update the specific group in Supabase if it's a UUID tour
    if (isUuid(tourId) && groupId) {
      try {
        // Use the direct persistence function
        updateSuccess = await persistGuideAssignment(
          tourId, 
          groupId, 
          actualGuideId, 
          groupsWithUpdates[groupIndex].name
        );
        
        console.log(`Direct persistence result: ${updateSuccess ? 'Success' : 'Failed'}`);
        
        // If direct persistence failed, try the update method as fallback
        if (!updateSuccess) {
          updateSuccess = await updateGuideInSupabase(
            tourId,
            groupId,
            actualGuideId,
            groupsWithUpdates[groupIndex].name
          );
          console.log(`Fallback update result: ${updateSuccess ? 'Success' : 'Failed'}`);
        }
      } catch (error) {
        console.error("Error with direct persistence:", error);
      }
    }
    
    // If direct update failed or it's not a UUID tour, try the updateTourGroups API function
    if (!updateSuccess) {
      console.log("Falling back to updateTourGroups API");
      try {
        updateSuccess = await updateTourGroups(tourId, groupsWithUpdates);
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
      
      // Force a refresh after a short delay to ensure data is fresh
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 1000);
    } else {
      toast.error("Could not persist guide assignment");
      
      // CRITICAL FIX: If server update failed, still apply optimistic update to prevent UI flashing
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        const newData = JSON.parse(JSON.stringify(oldData));
        newData.tourGroups = groupsWithUpdates;
        return newData;
      });
    }
    
    return {
      success: true, // We consider this a UI success even if server persistence failed
      updatedGroups: groupsWithUpdates,
      guideName,
      groupName: updatedTourGroups[groupIndex].name || ""
    };
    
  } catch (error) {
    console.error("Error processing guide assignment:", error);
    toast.error("Failed to assign guide to group");
    throw error;
  }
};
