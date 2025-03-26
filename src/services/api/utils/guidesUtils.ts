
/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Check if a guide ID is a special ID (like "guide1", "guide2", etc.)
 */
export const isSpecialGuideId = (guideId?: string): boolean => {
  if (!guideId) return false;
  return ["guide1", "guide2", "guide3", "_none"].includes(guideId);
};

/**
 * Map special guide IDs to UUIDs from the tour object if possible
 */
export const mapSpecialGuideIdToUuid = (
  guideId: string,
  tour: any
): string => {
  if (!guideId || !tour) return guideId;
  
  switch (guideId) {
    case "guide1":
      return tour.guide1Id || guideId;
    case "guide2":
      return tour.guide2Id || guideId;
    case "guide3":
      return tour.guide3Id || guideId;
    default:
      return guideId;
  }
};

/**
 * Format a guide ID for display (truncated UUID)
 */
export const formatGuideId = (id: string): string => {
  if (!id) return 'None';
  if (isValidUuid(id)) {
    return `${id.substring(0, 8)}...`;
  }
  return id;
};

/**
 * Check if a guide is assigned to a tour
 */
export const isGuideAssignedToTour = (
  guideId: string,
  tour: any
): boolean => {
  if (!guideId || !tour) return false;
  
  return (
    guideId === tour.guide1Id ||
    guideId === tour.guide2Id ||
    guideId === tour.guide3Id
  );
};
