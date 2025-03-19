
import { toast } from "sonner";

/**
 * Validates input parameters for guide assignment
 */
export const validateGuideAssignmentInputs = (
  tourId: string,
  groupIndex: number,
  currentTour: any,
  updatedTourGroups: any[]
): { 
  isValid: boolean; 
  errorMessage?: string;
  groupId?: string;
  groupName?: string;
} => {
  // Check for tour data
  if (!currentTour) {
    const errorMessage = "Tour not found";
    console.error(errorMessage);
    toast.error(errorMessage);
    return { isValid: false, errorMessage };
  }
  
  // Validate tour ID
  if (!tourId) {
    const errorMessage = "Invalid tour ID";
    console.error(errorMessage);
    toast.error(errorMessage);
    return { isValid: false, errorMessage };
  }
  
  // Check if the group exists at the specified index
  if (!updatedTourGroups[groupIndex]) {
    const errorMessage = `Group at index ${groupIndex} does not exist`;
    console.error(errorMessage);
    toast.error(errorMessage);
    return { isValid: false, errorMessage };
  }
  
  // Extract group data for convenience
  const groupId = updatedTourGroups[groupIndex]?.id;
  const groupName = updatedTourGroups[groupIndex]?.name || `Group ${groupIndex + 1}`;
  
  return { 
    isValid: true,
    groupId,
    groupName
  };
};
