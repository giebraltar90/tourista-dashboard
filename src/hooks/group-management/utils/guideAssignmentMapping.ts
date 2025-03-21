
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Maps a guide ID to a UUID format expected by the database
 * This handles special guide IDs like "guide1", "guide2", etc.
 */
export const mapGuideIdToUuid = (
  guideId: string, 
  tour: any, 
  guides: any[] = []
): string | null => {
  // If it's already a UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Special handling for standard tour guide references
  if (guideId === "guide1" && tour.guide1) {
    // Try to find the UUID for this guide in guides array
    const guide = guides.find(g => g.name === tour.guide1);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide1 "${tour.guide1}" to UUID: ${guide.id}`);
      return guide.id;
    }
    // If no match in guides, use the name directly if it looks like a UUID
    if (tour.guide1 && isValidUuid(tour.guide1)) {
      return tour.guide1;
    }
  }
  
  // Similar handling for guide2
  if (guideId === "guide2" && tour.guide2) {
    const guide = guides.find(g => g.name === tour.guide2);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide2 "${tour.guide2}" to UUID: ${guide.id}`);
      return guide.id;
    }
    if (tour.guide2 && isValidUuid(tour.guide2)) {
      return tour.guide2;
    }
  }
  
  // Similar handling for guide3
  if (guideId === "guide3" && tour.guide3) {
    const guide = guides.find(g => g.name === tour.guide3);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide3 "${tour.guide3}" to UUID: ${guide.id}`);
      return guide.id;
    }
    if (tour.guide3 && isValidUuid(tour.guide3)) {
      return tour.guide3;
    }
  }
  
  // For other cases, try to find the guide by name in the guides array
  const guideName = guideNameFromId(guideId, tour);
  if (guideName) {
    const guide = guides.find(g => g.name === guideName);
    if (guide && isValidUuid(guide.id)) {
      console.log(`Mapped guide "${guideName}" to UUID: ${guide.id}`);
      return guide.id;
    }
  }
  
  console.warn(`Could not map guide ID "${guideId}" to a valid UUID`);
  return null;
};

/**
 * Try to extract a guide name from a guide ID using tour data
 */
const guideNameFromId = (guideId: string, tour: any): string | null => {
  if (!tour) return null;
  
  if (guideId === "guide1") return tour.guide1 || null;
  if (guideId === "guide2") return tour.guide2 || null;
  if (guideId === "guide3") return tour.guide3 || null;
  
  return null;
};

/**
 * Validates if a string is a valid UUID
 */
export const isValidGuideUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
