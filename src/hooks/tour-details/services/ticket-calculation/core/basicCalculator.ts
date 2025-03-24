
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
    ticketType: "adult" | "child" | null;
    guideInfo: GuideInfo | null;
  }> 
} => {
  // Special logging for tour #324598820
  const isSpecialTour = location.includes('#324598820');
  
  if (isSpecialTour) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] basicCalculator starting with guides:`, {
      guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'none',
      guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'none',
      guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'none',
      location,
      tourGroupsCount: Array.isArray(tourGroups) ? tourGroups.length : 0
    });
  } else {
    logger.debug(`🎟️ [BasicCalculator] Starting calculation for location "${location}" with guides:`, {
      guide1: guide1Info?.name || 'none',
      guide1Type: guide1Info?.guideType || 'none',
      guide2: guide2Info?.name || 'none',
      guide2Type: guide2Info?.guideType || 'none',
      guide3: guide3Info?.name || 'none', 
      guide3Type: guide3Info?.guideType || 'none',
    });
  }
  
  // Skip calculation if location doesn't require tickets
  if (!locationRequiresGuideTickets(location)) {
    if (isSpecialTour) {
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Location check determined no tickets needed`);
    } else {
      logger.debug(`🎟️ [BasicCalculator] Location "${location}" doesn't require guide tickets, returning zero`);
    }
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Ensure tour groups is an array
  const validTourGroups = Array.isArray(tourGroups) ? tourGroups : [];
  
  // Find assigned guides and log results
  const assignedGuideIds = findAssignedGuides(validTourGroups, guide1Info, guide2Info, guide3Info);
  
  if (isSpecialTour) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Assigned guides found:`, {
      guideIds: Array.from(assignedGuideIds),
      guide1Assigned: assignedGuideIds.has("guide1"),
      guide2Assigned: assignedGuideIds.has("guide2"),
      guide3Assigned: assignedGuideIds.has("guide3")
    });
  } else {
    logger.debug(`🎟️ [BasicCalculator] Found ${assignedGuideIds.size} assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  }
  
  if (assignedGuideIds.size === 0) {
    // Check if we have guide1 (default guide) that needs to be included
    if (isDefaultGuide(guide1Info, locationRequiresGuideTickets(location))) {
      if (isSpecialTour) {
        logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] No assigned guides, but default guide1 exists:`, {
          guide1Name: guide1Info?.name,
          guide1Type: guide1Info?.guideType
        });
      } else {
        logger.debug(`🎟️ [BasicCalculator] No assigned guides, but default guide1 exists:`, {
          guide1Name: guide1Info?.name,
          guide1Type: guide1Info?.guideType
        });
      }
      
      // Process the default guide
      const guide1Result = processDefaultGuide(
        guide1Info,
        locationRequiresGuideTickets(location),
        "guide1",
        processGuideTicketRequirement
      );
      
      if (guide1Result && guide1Result.needsTicket) {
        const result = {
          adultTickets: guide1Result.ticketType === 'adult' ? 1 : 0,
          childTickets: guide1Result.ticketType === 'child' ? 1 : 0,
          guides: [{
            guideName: guide1Result.guideName,
            guideType: guide1Result.guideType || "Unknown",
            ticketType: guide1Result.ticketType,
            guideInfo: guide1Info
          }]
        };
        
        if (isSpecialTour) {
          logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Default guide1 needs a ticket:`, {
            guide1Result,
            adultTickets: result.adultTickets,
            childTickets: result.childTickets,
            ticketType: guide1Result.ticketType
          });
        }
        
        return result;
      }
    }
    
    if (isSpecialTour) {
      logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] No guides assigned, returning zero tickets`);
    } else {
      logger.debug(`🎟️ [BasicCalculator] No assigned guides found, returning zero tickets`);
    }
    
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Process each guide
  const guide1Result = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Result = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Result = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  if (isSpecialTour) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] Individual guide ticket processing results:`, {
      guide1: {
        name: guide1Result.guideName,
        type: guide1Result.guideType,
        needsTicket: guide1Result.needsTicket,
        ticketType: guide1Result.ticketType
      },
      guide2: {
        name: guide2Result.guideName,
        type: guide2Result.guideType,
        needsTicket: guide2Result.needsTicket,
        ticketType: guide2Result.ticketType
      },
      guide3: {
        name: guide3Result.guideName,
        type: guide3Result.guideType,
        needsTicket: guide3Result.needsTicket,
        ticketType: guide3Result.ticketType
      }
    });
  }
  
  // Collect all guide results
  const allGuideResults = [guide1Result, guide2Result, guide3Result];
  
  // Filter to only guides that need tickets for counting
  const guidesWithRequirements = allGuideResults.filter(g => g.needsTicket);
  
  // Count tickets by type
  const { adultTickets, childTickets } = countTicketsByType(guidesWithRequirements);
  
  // Map all guides to the result format (needed or not)
  const guides = mapGuidesToResultFormat(allGuideResults, [guide1Info, guide2Info, guide3Info]);
  
  // Log final counts
  if (isSpecialTour) {
    logger.debug(`🔍 [TOUR #324598820 INTENSIVE MONITORING] FINAL GUIDE TICKET COUNTS:`, {
      adultTickets,
      childTickets,
      totalTickets: adultTickets + childTickets,
      guidesWithTickets: guidesWithRequirements.length,
      guideDetails: guides.map(g => ({
        name: g.guideName, 
        type: g.guideType, 
        needsTicket: g.ticketType !== null, 
        ticketType: g.ticketType
      }))
    });
  } else {
    logger.debug(`🎟️ [BasicCalculator] Final guide ticket counts:`, {
      adultTickets,
      childTickets,
      totalTickets: adultTickets + childTickets,
      guidesWithTickets: guidesWithRequirements.length,
      guideDetails: guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
    });
  }
  
  return {
    adultTickets,
    childTickets,
    guides
  };
};
