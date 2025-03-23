
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Find which guides are assigned to groups for this tour
 */
export const findAssignedGuides = (
  tourGroups: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): Set<string> => {
  const assignedGuideIds = new Set<string>();
  
  // Ensure tour groups is an array
  if (!Array.isArray(tourGroups)) {
    logger.debug(`🎟️ [findAssignedGuides] tourGroups is not an array, skipping assignment check`);
    return assignedGuideIds;
  }
  
  // Build a map of guide IDs to their position (guide1, guide2, guide3)
  const guideMap = new Map<string, string>();
  
  if (guide1Info?.id) guideMap.set(guide1Info.id, "guide1");
  if (guide2Info?.id) guideMap.set(guide2Info.id, "guide2");
  if (guide3Info?.id) guideMap.set(guide3Info.id, "guide3");
  
  // For logging: collect guide info for assigned guides
  const assignedGuides: Array<{id: string, position: string, name: string}> = [];
  
  // Check each group to see if it has a guide assigned
  for (const group of tourGroups) {
    if (!group) continue;
    
    const guideId = group.guideId || group.guide_id;
    
    if (guideId && guideId !== "unassigned") {
      // Is this a guide we know about?
      const guidePosition = guideMap.get(guideId);
      
      if (guidePosition) {
        assignedGuideIds.add(guidePosition);
        
        // Add to our logging collection
        assignedGuides.push({
          id: guideId,
          position: guidePosition,
          name: group.guideName || "Unknown"
        });
      } else {
        // This is a guide we don't know about, but they're still assigned
        logger.debug(`🎟️ [findAssignedGuides] Found guide ID assigned to a group: ${guideId}`);
        
        // If this is guide1, guide2, or guide3 by ID string, add it
        if (guideId === "guide1") assignedGuideIds.add("guide1");
        if (guideId === "guide2") assignedGuideIds.add("guide2");
        if (guideId === "guide3") assignedGuideIds.add("guide3");
      }
    }
  }
  
  // Log the results
  logger.debug(`🎟️ [findAssignedGuides] Found ${assignedGuideIds.size} assigned guides:`, {
    assignedGuidePositions: Array.from(assignedGuideIds),
    guideDetails: assignedGuides
  });
  
  return assignedGuideIds;
};

/**
 * Get ticket requirement for a specific guide
 */
export const getGuideTicketRequirement = (
  guidePosition: string,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): { ticketType: "adult" | "child" | null, guideInfo: GuideInfo | null } => {
  let guideInfo: GuideInfo | null = null;
  
  // Match guide position to the correct guide info
  if (guidePosition === "guide1") {
    guideInfo = guide1Info;
  } else if (guidePosition === "guide2") {
    guideInfo = guide2Info;
  } else if (guidePosition === "guide3") {
    guideInfo = guide3Info;
  }
  
  // If we don't have guide info, return null ticket type
  if (!guideInfo) {
    return { ticketType: null, guideInfo: null };
  }
  
  // Get the guide type from the guide info
  const guideType = guideInfo.guideType || "";
  
  // Determine ticket type based on guide type
  const ticketType = determineTicketTypeForGuide(guideType);
  
  return { ticketType, guideInfo };
};

// Import the ticket determination function to avoid circular dependencies
const determineTicketTypeForGuide = (guideType: string = ""): "adult" | "child" | null => {
  // Simple implementation for this utility
  const normalizedType = guideType?.toLowerCase().trim() || "";
  
  if (normalizedType.includes("gc")) {
    return null; // No ticket for GC
  } else if (normalizedType.includes("ga free")) {
    return "child"; // Child ticket for GA Free
  } else if (normalizedType.includes("ga ticket")) {
    return "adult"; // Adult ticket for GA Ticket
  }
  
  // Default is no ticket if we don't recognize the type
  return null;
};
