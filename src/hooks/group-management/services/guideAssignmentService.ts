
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { updateTourGroups, updateTourModification } from "@/services/ventrataApi";
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
  
  // Generate a new group name if needed
  const newGroupName = generateGroupName(groupName, guideName);
  
  // Update the group with new guide ID and possibly new name
  updatedTourGroups[groupIndex] = {
    ...updatedTourGroups[groupIndex],
    guideId: actualGuideId,
    name: newGroupName
  };

  return updatedTourGroups;
};

/**
 * Handles direct Supabase update for UUID tours
 */
export const updateGuideInSupabase = async (
  tourId: string,
  groupId: string, 
  actualGuideId: string | undefined, 
  newGroupName: string
): Promise<boolean> => {
  try {
    console.log(`Updating guide assignment in Supabase for group ${groupId}:`, {
      guide_id: actualGuideId,
      name: newGroupName
    });
    
    const { error } = await supabase
      .from('tour_groups')
      .update({
        guide_id: actualGuideId,
        name: newGroupName
      })
      .eq('id', groupId);
      
    if (error) {
      console.error("Supabase direct group update failed:", error);
      return false;
    }
    
    console.log("Successfully updated guide assignment in Supabase with direct update");
    return true;
  } catch (error) {
    console.error("Error with direct Supabase update:", error);
    return false;
  }
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
  const modificationDescription = guideName !== "Unassigned"
    ? `Guide ${guideName} assigned to group ${groupName}`
    : `Guide removed from group ${groupName}`;
    
  try {
    await updateTourModification(tourId, {
      description: modificationDescription,
      details: {
        type: "guide_assignment",
        groupIndex,
        guideId: actualGuideId,
        guideName,
        groupName
      }
    });
    
    // Also add to local modifications
    addModification(modificationDescription, {
      type: "guide_assignment",
      groupIndex,
      guideId: actualGuideId,
      guideName,
      groupName
    });
  } catch (error) {
    console.error("Failed to record modification:", error);
  }
};
