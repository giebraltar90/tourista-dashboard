import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourModification } from "@/services/api/modificationApi";
import { Json } from "@/integrations/supabase/types";
import { generateGroupName } from "../utils/guideNameUtils";
import { updateGuideInSupabase } from "@/services/api/guideAssignmentService";

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
  
  // Generate a proper group name based on index
  const baseGroupName = `Group ${groupIndex + 1}`;
  
  // Add guide name in parenthesis if assigned
  const newGroupName = actualGuideId ? 
    `${baseGroupName} (${guideName})` : 
    baseGroupName;
  
  // Create a deep copy of the updatedTourGroups to avoid mutation issues
  const result = JSON.parse(JSON.stringify(updatedTourGroups));
  
  // Update the group with new guide ID and name
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

/**
 * Validates that a guide assignment operation can proceed
 */
export const validateGuideAssignment = (
  tour: any,
  groupIndex: number,
  guideId?: string | null
): { valid: boolean; errorMessage?: string } => {
  if (!tour) {
    return {
      valid: false,
      errorMessage: "Cannot assign guide: Tour data not available"
    };
  }
  
  // Validate groupIndex is within bounds
  if (groupIndex < 0 || groupIndex >= (tour.tourGroups?.length || 0)) {
    return {
      valid: false,
      errorMessage: `Invalid group index: ${groupIndex}. Available groups: ${tour.tourGroups?.length}`
    };
  }
  
  // Get the target group
  const targetGroup = tour.tourGroups?.[groupIndex];
  if (!targetGroup) {
    return {
      valid: false,
      errorMessage: "Group not found"
    };
  }
  
  // Get the group ID
  const groupId = targetGroup.id;
  if (!groupId) {
    return {
      valid: false,
      errorMessage: "Cannot assign guide: Group ID is missing"
    };
  }
  
  return { valid: true };
};

/**
 * Find guide name from ID using multiple lookup strategies
 */
export const findGuideName = (
  guideId: string | null | undefined,
  guides: any[],
  tour: any
): string => {
  // Default name if no guide is assigned
  if (!guideId) {
    return "Unassigned";
  }
  
  // Try to find guide name in the guides array first
  const guide = guides.find(g => g.id === guideId);
  if (guide) {
    return guide.name;
  }
  
  // Fallback to looking in tour properties
  if (tour) {
    if (guideId === "guide1" && tour.guide1) return tour.guide1;
    if (guideId === "guide2" && tour.guide2) return tour.guide2;
    if (guideId === "guide3" && tour.guide3) return tour.guide3;
    
    // Try harder to find the name
    if (tour.guide1 && guides.find(g => g.name === tour.guide1)?.id === guideId) {
      return tour.guide1;
    } else if (tour.guide2 && guides.find(g => g.name === tour.guide2)?.id === guideId) {
      return tour.guide2;
    } else if (tour.guide3 && guides.find(g => g.name === tour.guide3)?.id === guideId) {
      return tour.guide3;
    }
  }
  
  // Last resort fallback
  return guideId.startsWith("guide") ? `Guide ${guideId.slice(5)}` : guideId.substring(0, 8);
};

/**
 * Generate a new group name that includes the guide if assigned
 */
export const generateGroupNameWithGuide = (
  groupNumber: number,
  guideName: string | null | undefined
): string => {
  return guideName && guideName !== "Unassigned"
    ? `Group ${groupNumber} (${guideName})`
    : `Group ${groupNumber}`;
};

/**
 * Apply optimistic update to the UI for guide assignment
 */
export const applyOptimisticUpdate = (
  queryClient: any,
  tourId: string,
  groupIndex: number,
  actualGuideId: string | null,
  groupName: string,
  guideName: string
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a deep copy to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Update the specific group
    if (newData.tourGroups && newData.tourGroups[groupIndex]) {
      newData.tourGroups[groupIndex].guideId = actualGuideId;
      newData.tourGroups[groupIndex].name = groupName;
      
      // Also update guideName if present
      if (actualGuideId) {
        newData.tourGroups[groupIndex].guideName = guideName;
      } else {
        newData.tourGroups[groupIndex].guideName = undefined;
      }
    }
    
    return newData;
  });
};

/**
 * Create a human-readable description for the guide assignment operation
 */
export const createModificationDescription = (
  actualGuideId: string | null | undefined,
  guideName: string,
  groupNumber: number
): string => {
  return actualGuideId
    ? `Assigned guide ${guideName} to Group ${groupNumber}`
    : `Removed guide from Group ${groupNumber}`;
};

/**
 * Handle post-assignment cache invalidation and refetching
 */
export const refreshCacheAfterAssignment = (
  queryClient: any,
  tourId: string,
  refetch: () => Promise<any>
): void => {
  // Force a refetch after a delay to ensure server data is synced
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    queryClient.invalidateQueries({ queryKey: ['tours'] });
    refetch();
  }, 800);
};
