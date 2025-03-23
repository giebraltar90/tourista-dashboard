
/**
 * Process guide ID (handle special cases like "guide1", "_none", etc.)
 */
export const processGuideId = async (guideId: string): Promise<string | null> => {
  // Handle special case for removing a guide
  if (!guideId || guideId === "_none") {
    return null;
  }
  
  // Return the guide ID as is
  return guideId;
};
