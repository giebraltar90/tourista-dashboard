
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
  let groupName = updatedTourGroups[groupIndex].name;
  
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
