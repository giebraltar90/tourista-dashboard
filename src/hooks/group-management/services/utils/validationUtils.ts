
import { toast } from "sonner";

/**
 * Validates inputs for guide assignment
 */
export const validateGuideAssignmentInputs = (
  tourId: string, 
  groupIndex: number, 
  currentTour: any, 
  updatedTourGroups: any[]
) => {
  if (!tourId) {
    console.error("Missing tour ID for guide assignment");
    toast.error("Error: Missing tour information");
    return { isValid: false };
  }
  
  if (groupIndex < 0 || groupIndex >= updatedTourGroups.length) {
    console.error(`Invalid group index: ${groupIndex}`);
    toast.error("Error: Invalid group selection");
    return { isValid: false };
  }
  
  const groupId = updatedTourGroups[groupIndex].id;
  if (!groupId) {
    console.error(`Group at index ${groupIndex} has no ID`);
    toast.error("Error: Group has no identifier");
    return { isValid: false };
  }
  
  const groupName = updatedTourGroups[groupIndex].name || `Group ${groupIndex + 1}`;
  
  return {
    isValid: true,
    groupId,
    groupName
  };
};
