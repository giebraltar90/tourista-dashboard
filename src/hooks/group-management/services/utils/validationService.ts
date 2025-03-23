
import { toast } from "sonner";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
  return isValidUuid(id);
};

/**
 * Validates participant movement operation
 */
export const validateParticipantMove = (
  fromGroupIndex: number,
  toGroupIndex: number,
  participant: VentrataParticipant | undefined,
  groups: VentrataTourGroup[]
) => {
  // Check for missing participant data
  if (!participant) {
    return {
      valid: false,
      errorMessage: "No participant selected for move operation"
    };
  }
  
  // Check for identical source and destination
  if (fromGroupIndex === toGroupIndex) {
    return {
      valid: false,
      errorMessage: "Participant is already in this group"
    };
  }
  
  // Validate group indices
  if (!Array.isArray(groups)) {
    return {
      valid: false,
      errorMessage: "Group data is missing or invalid"
    };
  }
  
  if (fromGroupIndex < 0 || fromGroupIndex >= groups.length) {
    return {
      valid: false,
      errorMessage: `Invalid source group index: ${fromGroupIndex}`
    };
  }
  
  if (toGroupIndex < 0 || toGroupIndex >= groups.length) {
    return {
      valid: false,
      errorMessage: `Invalid destination group index: ${toGroupIndex}`
    };
  }
  
  // If validation passes
  return { valid: true };
};

