
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Find UUID for a guide by looking up their name in the guides array
 * This helps with the mapping of special guide IDs to UUIDs
 */
export const findGuideUuidByName = (
  guideName: string,
  guides: any[]
): string | null => {
  if (!guideName || !guides || !Array.isArray(guides)) {
    return null;
  }
  
  // Look for an exact name match
  const matchedGuide = guides.find(g => g.name === guideName);
  if (matchedGuide && isValidUuid(matchedGuide.id)) {
    console.log(`Found guide UUID ${matchedGuide.id} for name: ${guideName}`);
    return matchedGuide.id;
  }
  
  return null;
};

/**
 * Enhanced version of the mapping function that handles both special IDs (guide1, guide2)
 * and uses the tour data to map to actual UUIDs needed for database operations
 */
export const mapGuideIdToUuid = (
  guideId: string,
  tour: any,
  guides: any[]
): string | null => {
  console.log(`Mapping guide ID: ${guideId}`, {
    tourData: tour ? {
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3
    } : 'No tour data',
    guidesCount: guides ? guides.length : 0
  });
  
  // If it's already a valid UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Handle special guide IDs with corresponding name lookups
  if (guideId === 'guide1' && tour?.guide1) {
    // First try to find the UUID directly by name
    const uuid = findGuideUuidByName(tour.guide1, guides);
    if (uuid) {
      return uuid;
    }
    
    // If that fails, try to use guide1_id from the tour if available
    if (tour.guide1_id && isValidUuid(tour.guide1_id)) {
      return tour.guide1_id;
    }
    
    console.error(`Could not find UUID for guide1 (${tour.guide1})`);
  }
  
  if (guideId === 'guide2' && tour?.guide2) {
    const uuid = findGuideUuidByName(tour.guide2, guides);
    if (uuid) {
      return uuid;
    }
    
    if (tour.guide2_id && isValidUuid(tour.guide2_id)) {
      return tour.guide2_id;
    }
    
    console.error(`Could not find UUID for guide2 (${tour.guide2})`);
  }
  
  if (guideId === 'guide3' && tour?.guide3) {
    const uuid = findGuideUuidByName(tour.guide3, guides);
    if (uuid) {
      return uuid;
    }
    
    if (tour.guide3_id && isValidUuid(tour.guide3_id)) {
      return tour.guide3_id;
    }
    
    console.error(`Could not find UUID for guide3 (${tour.guide3})`);
  }
  
  // Last resort: check if the ID itself is a name and try to find the UUID
  if (guides && Array.isArray(guides)) {
    const guidesById = guides.find(g => g.id === guideId);
    if (guidesById) return guidesById.id;
    
    const guidesByName = guides.find(g => g.name === guideId);
    if (guidesByName && isValidUuid(guidesByName.id)) {
      return guidesByName.id;
    }
  }
  
  console.error(`Failed to map guide ID "${guideId}" to a valid UUID`);
  return null;
};
