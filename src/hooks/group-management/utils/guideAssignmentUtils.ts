
import { GuideOption } from "../types";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Find guide UUID by name in a list of guides
 */
export const findGuideUuidByName = (guideName: string, allGuides: any[]): string | null => {
  const guide = allGuides.find(g => g.name === guideName);
  if (guide && isValidUuid(guide.id)) {
    console.log(`Found guide UUID ${guide.id} for name: ${guideName}`);
    return guide.id;
  }
  return null;
};

/**
 * Process guide ID for assignment, handling special IDs and mapping to UUIDs
 */
export const processGuideIdForAssignment = (
  guideId: string | undefined, 
  guides: GuideOption[], 
  allGuides: any[],
  tour?: any
): string | null => {
  // Handle removal case
  if (!guideId || guideId === "_none") {
    return null;
  }
  
  // If it's already a valid UUID, return it directly
  if (isValidUuid(guideId)) {
    return guideId;
  }
  
  // Find the selected guide by id in our guides array to get the name
  const selectedGuide = guides.find(g => g.id === guideId);
  
  if (selectedGuide && selectedGuide.name) {
    // Try to find the UUID by name first
    const uuidByName = findGuideUuidByName(selectedGuide.name, allGuides);
    if (uuidByName) {
      console.log(`Mapped guide name ${selectedGuide.name} to UUID: ${uuidByName}`);
      return uuidByName;
    }
  }
  
  // If we can't find by name, try the standard mapping with tour data
  if (tour) {
    // Prepare enhanced tour data for mapping
    const enhancedTour = {
      ...tour,
      guides: allGuides
    };
    
    // Use the mapSpecialGuideIdToUuid function from guidesUtils
    const mappedId = mapSpecialGuideIdToUuid(guideId, enhancedTour);
    console.log("Mapped special guide ID to UUID:", { 
      original: guideId, 
      mapped: mappedId 
    });
    
    return mappedId;
  }
  
  console.error(`Failed to map guide ID "${guideId}" to a valid UUID`);
  return null;
};

// Import the existing function to avoid circular dependency
import { mapSpecialGuideIdToUuid } from "@/services/api/utils/guidesUtils";
