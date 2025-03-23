
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Maps guide IDs to their UUID equivalents for database operations
 */
export const mapGuideIdToUuid = (
  guideId: string,
  tour: any,
  guides: any[] = []
): string | null => {
  // If it's empty or _none, return null to unassign
  if (!guideId || guideId === "_none") return null;
  
  // If it's already a UUID, return it
  if (isValidUuid(guideId)) return guideId;
  
  // Handle special guide IDs
  if (guideId === "guide1" && tour?.guide1) {
    // Try to find the UUID for guide1
    const guide = guides.find(g => g.name === tour.guide1);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Found UUID for guide1 (${tour.guide1}): ${guide.id}`);
      return guide.id;
    }
    
    // Fall back to the tour's guide1Id if available
    if (tour.guide1Id && isValidUuid(tour.guide1Id)) {
      console.log(`Using guide1Id from tour: ${tour.guide1Id}`);
      return tour.guide1Id;
    }
  }
  
  if (guideId === "guide2" && tour?.guide2) {
    // Try to find the UUID for guide2
    const guide = guides.find(g => g.name === tour.guide2);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Found UUID for guide2 (${tour.guide2}): ${guide.id}`);
      return guide.id;
    }
    
    // Fall back to the tour's guide2Id if available
    if (tour.guide2Id && isValidUuid(tour.guide2Id)) {
      console.log(`Using guide2Id from tour: ${tour.guide2Id}`);
      return tour.guide2Id;
    }
  }
  
  if (guideId === "guide3" && tour?.guide3) {
    // Try to find the UUID for guide3
    const guide = guides.find(g => g.name === tour.guide3);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Found UUID for guide3 (${tour.guide3}): ${guide.id}`);
      return guide.id;
    }
    
    // Fall back to the tour's guide3Id if available
    if (tour.guide3Id && isValidUuid(tour.guide3Id)) {
      console.log(`Using guide3Id from tour: ${tour.guide3Id}`);
      return tour.guide3Id;
    }
  }
  
  // Try to find by name match as a last resort
  const matchingGuide = guides.find(g => g.name === guideId);
  if (matchingGuide && isValidUuid(matchingGuide.id)) {
    console.log(`Found guide by name match: ${matchingGuide.id}`);
    return matchingGuide.id;
  }
  
  console.error(`Could not map guide ID "${guideId}" to a valid UUID`);
  return null;
};
