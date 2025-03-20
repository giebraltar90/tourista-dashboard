
import { toast } from "sonner";

/**
 * Validates guide assignment parameters
 */
export const validateGuideAssignment = (tour: any, groupIndex: number, guideId?: string | null) => {
  // Handle missing tour data
  if (!tour || !tour.tourGroups) {
    return {
      valid: false,
      errorMessage: "Tour data is missing or incomplete"
    };
  }
  
  // Validate group index
  if (groupIndex < 0 || groupIndex >= tour.tourGroups.length) {
    return {
      valid: false,
      errorMessage: `Invalid group index: ${groupIndex}`
    };
  }
  
  // If validation passes
  return { valid: true };
};

/**
 * Validates that a UUID is properly formatted
 */
export const validateUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
