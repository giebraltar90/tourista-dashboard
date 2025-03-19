
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { updateTourGroups } from "@/services/api/tourGroupApi";
import { findGuideName, generateGroupName } from "../utils/guideNameUtils";

/**
 * Updates the group with new guide ID and possibly new name
 */
export const prepareGroupUpdate = (
  updatedTourGroups: any[], 
  groupIndex: number, 
  actualGuideId: string | undefined, 
  guideName: string
) => {
  // Get the current group name
  let groupName = updatedTourGroups[groupIndex].name || `Group ${groupIndex + 1}`;
  
  // Generate a new group name only if we're assigning a guide (not unassigning)
  let newGroupName = groupName;
  if (actualGuideId) {
    newGroupName = generateGroupName(groupName, guideName);
  }
  
  // Update the group with new guide ID and possibly new name
  updatedTourGroups[groupIndex] = {
    ...updatedTourGroups[groupIndex],
    guideId: actualGuideId,
    name: newGroupName
  };

  return updatedTourGroups;
};

/**
 * Records the guide assignment modification
 */
export const recordGuideAssignmentModification = async (
  tourId: string,
  groupIndex: number,
  actualGuideId: string | undefined,
  guideName: string,
  groupName: string,
  addModification: (description: string, details: any) => void
): Promise<void> => {
  const modificationDescription = actualGuideId
    ? `Guide ${guideName} assigned to group ${groupName}`
    : `Guide removed from group ${groupName}`;
    
  try {
    const modDetails = {
      type: "guide_assignment",
      groupIndex,
      guideId: actualGuideId,
      guideName,
      groupName
    };
    
    // Also add to local modifications
    addModification(modificationDescription, modDetails);
  } catch (error) {
    console.error("Failed to record modification:", error);
  }
};

/**
 * Persist guide ID to make sure it doesn't revert back
 */
export const persistGuideAssignment = async (
  tourId: string,
  groupId: string,
  guideId: string | undefined,
  groupName: string
): Promise<boolean> => {
  if (!isUuid(tourId) || !groupId) {
    console.error("Cannot persist guide assignment: Invalid tour or group ID");
    return false;
  }

  try {
    console.log(`Persisting guide assignment for group ${groupId}:`, {
      guide_id: guideId,
      name: groupName
    });

    // CRITICAL FIX: Multiple attempts to ensure the update goes through
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { error } = await supabase
        .from('tour_groups')
        .update({
          guide_id: guideId,
          name: groupName
        })
        .eq('id', groupId)
        .eq('tour_id', tourId);

      if (!error) {
        console.log(`Successfully persisted guide assignment on attempt ${attempt}`);
        return true;
      }
      
      if (attempt < 2) {
        console.warn(`Attempt ${attempt} to persist guide assignment failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retrying
      } else {
        console.error("All attempts to persist guide assignment failed:", error);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error persisting guide assignment:", error);
    return false;
  }
};
