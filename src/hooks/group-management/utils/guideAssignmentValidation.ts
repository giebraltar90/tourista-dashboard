
/**
 * Validates all parameters before performing a guide assignment
 */
export const validateGuideAssignment = (
  tour: any, 
  groupIndex: number, 
  guideId?: string | null
): { valid: boolean; errorMessage?: string } => {
  // Check for valid tour data
  if (!tour) {
    return { valid: false, errorMessage: "Tour data is missing" };
  }
  
  // Check for valid tour groups
  if (!tour.tourGroups || !Array.isArray(tour.tourGroups)) {
    return { valid: false, errorMessage: "Tour groups data is invalid" };
  }
  
  // Check for valid group index
  if (groupIndex < 0 || groupIndex >= tour.tourGroups.length) {
    return { 
      valid: false, 
      errorMessage: `Invalid group index: ${groupIndex}. Tour has ${tour.tourGroups.length} groups.` 
    };
  }
  
  // Special case for "_none" which means removing a guide
  if (guideId === "_none") {
    return { valid: true }; // Valid for removing a guide
  }
  
  // If a guide ID is provided, ensure it's not empty or just whitespace
  if (guideId && guideId.trim() === "") {
    return { valid: false, errorMessage: "Guide ID cannot be empty" };
  }
  
  return { valid: true };
};
