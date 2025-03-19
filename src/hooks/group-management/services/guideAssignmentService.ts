
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { updateTourGroups, updateGuideInSupabase } from "@/services/api/tourGroupApi";
import { findGuideName, generateGroupName } from "../utils/guideNameUtils";
import { toast } from "sonner";

/**
 * Updates the group with new guide ID and possibly new name
 */
export const prepareGroupUpdate = (
  updatedTourGroups: any[], 
  groupIndex: number, 
  actualGuideId: string | undefined, 
  guideName: string
) => {
  // Ensure we have valid inputs
  if (!updatedTourGroups || !Array.isArray(updatedTourGroups) || groupIndex < 0 || groupIndex >= updatedTourGroups.length) {
    console.error("Invalid inputs to prepareGroupUpdate:", { updatedTourGroups, groupIndex, actualGuideId, guideName });
    return updatedTourGroups;
  }
  
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
  if (!tourId) {
    console.warn("Cannot record modification: Missing tour ID");
    return;
  }
  
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
    
    // Add to local modifications
    addModification(modificationDescription, modDetails);
  } catch (error) {
    console.error("Failed to record modification:", error);
  }
};

/**
 * Persist guide ID with improved error handling and multiple retry attempts
 */
export const persistGuideAssignment = async (
  tourId: string,
  groupId: string,
  guideId: string | undefined,
  groupName: string
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Cannot persist guide assignment: Invalid tour or group ID");
    return false;
  }

  // Maximum number of retry attempts
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      console.log(`Persisting guide assignment for group ${groupId} (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        guide_id: guideId,
        name: groupName
      });

      // First, try using the specialized update function with built-in retries
      success = await updateGuideInSupabase(tourId, groupId, guideId, groupName);
      
      if (success) {
        console.log("Successfully persisted guide assignment");
        break;
      }
      
      // If failed, try direct Supabase update as a fallback
      if (!success && attempt === MAX_RETRIES - 1) {
        console.warn("Trying direct Supabase update as last resort");
        const { error } = await supabase
          .from('tour_groups')
          .update({
            guide_id: guideId,
            name: groupName
          })
          .eq('id', groupId)
          .eq('tour_id', tourId);

        if (!error) {
          console.log("Successfully persisted guide assignment with fallback method");
          success = true;
        } else {
          console.error("Direct Supabase update failed:", error);
        }
      }
    } catch (error) {
      console.error(`Error persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
    
    // Increase retry attempt count
    attempt++;
    
    // Only wait between retries if we're going to retry
    if (!success && attempt < MAX_RETRIES) {
      const delay = Math.min(200 * Math.pow(2, attempt), 2000); // Exponential backoff
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return success;
};
