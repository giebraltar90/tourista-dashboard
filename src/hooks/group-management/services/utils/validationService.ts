
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
