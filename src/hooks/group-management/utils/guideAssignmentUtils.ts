import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Process a guide ID to ensure it's valid for assignment
 * 
 * This handles special cases like "_none" and ensures UUIDs are valid
 */
export const processGuideIdForAssignment = (
  guideId: string,
  guides: Array<{ id: string; name: string; info?: any }>
): string | null => {
  // Handle the "unassign guide" case
  if (!guideId || guideId === "_none") {
    return null;
  }
  
  // If it's already a valid UUID, use it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Special case for guide1, guide2, guide3 IDs
  if (guideId.startsWith('guide')) {
    // Try to find the matching guide in the guides array
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide) {
      // First check if the id is valid
      if (isValidUuid(matchingGuide.id)) {
        return matchingGuide.id;
      }
      
      // If not, check if the name is actually a valid UUID (happens with some data)
      if (isValidUuid(matchingGuide.name)) {
        return matchingGuide.name;
      }
      
      // Otherwise try to find a guide with the same name
      const guideWithSameName = guides.find(g => g.name === matchingGuide.name && isValidUuid(g.id));
      if (guideWithSameName) {
        return guideWithSameName.id;
      }
    }
  }
  
  // Try to find a guide with a matching name
  const guideByName = guides.find(g => g.name === guideId);
  if (guideByName && isValidUuid(guideByName.id)) {
    return guideByName.id;
  }
  
  // Log the issue for debugging
  console.warn(`Could not find a valid UUID for guide ID: ${guideId}`, {
    availableGuides: guides.map(g => ({ id: g.id, name: g.name }))
  });
  
  // Last resort: For "guide1", "guide2" ids, try to find any valid guide
  if (guideId === "guide1" || guideId === "guide2" || guideId === "guide3") {
    // Find the first guide with a valid UUID
    const firstValidGuide = guides.find(g => isValidUuid(g.id));
    if (firstValidGuide) {
      console.log(`Falling back to first valid guide (${firstValidGuide.name}) for ${guideId}`);
      return firstValidGuide.id;
    }
  }
  
  // If all else fails, return null to unassign the guide
  return null;
};
