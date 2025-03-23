
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { processGuideTicketRequirement } from "../guideTicketProcessor";
import { countTicketsByType, mapGuidesToResultFormat } from "./ticketAggregation";
import { isDefaultGuide, processDefaultGuide } from "./assignmentDetection";
import { findAssignedGuides } from "../guideAssignmentUtils";
import { locationRequiresGuideTickets } from "../locationUtils";

/**
 * Basic calculation of guide tickets needed for a tour
 */
export const calculateBasicGuideTickets = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
): { 
  adultTickets: number; 
  childTickets: number; 
  guides: Array<{ 
    guideName: string; 
    guideType: string; 
    ticketType: "adult" | "child" | null 
  }> 
} => {
  // Skip calculation if location doesn't require tickets
  if (!locationRequiresGuideTickets(location)) {
    logger.debug(`🎟️ [BasicCalculator] Location "${location}" doesn't require guide tickets, returning zero`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Ensure tour groups is an array
  const validTourGroups = Array.isArray(tourGroups) ? tourGroups : [];
  
  // Find assigned guides and log results
  const assignedGuideIds = findAssignedGuides(validTourGroups, guide1Info, guide2Info, guide3Info);
  logger.debug(`🎟️ [BasicCalculator] Found ${assignedGuideIds.size} assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  
  if (assignedGuideIds.size === 0) {
    // Check if we have guide1 (default guide) that needs to be included
    if (isDefaultGuide(guide1Info, locationRequiresGuideTickets(location))) {
      logger.debug(`🎟️ [BasicCalculator] No assigned guides, but default guide1 exists:`, {
        guide1Name: guide1Info?.name,
        guide1Type: guide1Info?.guideType
      });
      
      // Process the default guide
      const guide1Result = processDefaultGuide(
        guide1Info,
        locationRequiresGuideTickets(location),
        "guide1",
        processGuideTicketRequirement
      );
      
      if (guide1Result && guide1Result.needsTicket) {
        return {
          adultTickets: guide1Result.ticketType === 'adult' ? 1 : 0,
          childTickets: guide1Result.ticketType === 'child' ? 1 : 0,
          guides: [{
            guideName: guide1Result.guideName,
            guideType: guide1Result.guideType || "Unknown",
            ticketType: guide1Result.ticketType
          }]
        };
      }
    }
    
    logger.debug(`🎟️ [BasicCalculator] No assigned guides found, returning zero tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Process each guide
  const guide1Result = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Result = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Result = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Collect all guide results
  const allGuideResults = [guide1Result, guide2Result, guide3Result];
  
  // Filter to only guides that need tickets for counting
  const guidesWithRequirements = allGuideResults.filter(g => g.needsTicket);
  
  // Count tickets by type
  const { adultTickets, childTickets } = countTicketsByType(guidesWithRequirements);
  
  // Map all guides to the result format (needed or not)
  const guides = mapGuidesToResultFormat(allGuideResults);
  
  // Log final counts
  logger.debug(`🎟️ [BasicCalculator] Final guide ticket counts:`, {
    adultTickets,
    childTickets,
    totalTickets: adultTickets + childTickets,
    guidesWithTickets: guidesWithRequirements.length,
    guideDetails: guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return {
    adultTickets,
    childTickets,
    guides
  };
};
