
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
  if (!guideId || guideId === "_none") {
    return null; // Guide is being unassigned
  }
  
  // If it's already a valid UUID, use it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Special case for guide1, guide2, guide3 IDs
  if (guideId.startsWith('guide')) {
    // Try to find the matching guide in the guides array
    const matchingGuide = guides.find(g => g.id === guideId);
    if (matchingGuide && isValidUuid(matchingGuide.id)) {
      return matchingGuide.id;
    }
  }
  
  // Try to find a guide with a matching name
  const guideByName = guides.find(g => g.name === guideId);
  if (guideByName && isValidUuid(guideByName.id)) {
    return guideByName.id;
  }
  
  // Last-resort fallback: return the original ID
  console.warn(`Could not find a valid UUID for guide ID: ${guideId}`);
  return guideId;
};
