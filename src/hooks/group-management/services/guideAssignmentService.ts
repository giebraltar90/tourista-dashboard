
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourModification } from "@/services/api/modificationApi";
import { Json } from "@/integrations/supabase/types";
import { generateGroupName } from "../utils/guideNameUtils";

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
  // and only if the current name follows the default pattern
  let newGroupName = groupName;
  if (actualGuideId) {
    // Fixed: Pass the groupIndex parameter as a number instead of guideName as a string
    newGroupName = generateGroupName(groupName, groupIndex);
  }
  
  // Create a deep copy of the updatedTourGroups to avoid mutation issues
  const result = JSON.parse(JSON.stringify(updatedTourGroups));
  
  // Update the group with new guide ID and possibly new name
  result[groupIndex] = {
    ...result[groupIndex],
    guideId: actualGuideId,
    name: newGroupName
  };

  return result;
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
 * This is a more aggressive approach that will try multiple times with exponential backoff
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
  const MAX_RETRIES = 5;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      console.log(`Persisting guide assignment for group ${groupId} (attempt ${attempt + 1}/${MAX_RETRIES}):`, {
        guide_id: guideId,
        name: groupName
      });

      // First, try the direct updateGuideInSupabase function which has its own retry mechanism
      success = await updateGuideInSupabase(tourId, groupId, guideId, groupName);
      
      if (success) {
        console.log("Successfully persisted guide assignment using updateGuideInSupabase");
        break;
      }
      
      // If that fails, try a direct Supabase call
      const { error } = await supabase
        .from('tour_groups')
        .update({
          guide_id: guideId,
          name: groupName
        })
        .eq('id', groupId)
        .eq('tour_id', tourId);
        
      if (!error) {
        console.log("Successfully persisted guide assignment with direct Supabase call");
        success = true;
        
        // Force a delay to allow the database to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      } else {
        console.error(`Failed to persist guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
      }
    } catch (error) {
      console.error(`Error persisting guide assignment (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
    
    // Increase retry attempt count
    attempt++;
    
    // Only wait between retries if we're going to retry
    if (!success && attempt < MAX_RETRIES) {
      const delay = Math.min(500 * Math.pow(2, attempt), 5000); // Exponential backoff with max 5s
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return success;
};
