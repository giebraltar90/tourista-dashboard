
/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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
