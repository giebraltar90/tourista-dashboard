
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketCounts } from "../../../utils/guideTicketTypes";
import { processGuideTicketRequirement } from "../guideTicketProcessor";
import { findAssignedGuides } from "../guideAssignmentUtils";
import { locationRequiresGuideTickets } from "../locationUtils";
import { countTicketsByType, mapGuidesToResultFormat } from "./ticketAggregation";
import { isDefaultGuide, processDefaultGuide } from "./assignmentDetection";

/**
 * Calculate complete ticket requirements including details for guides
 */
export const calculateCompleteTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[]
): GuideTicketCounts => {
  logger.debug(`🎟️ [CompleteCalculator] Starting complete calculation for location "${location}"`);
  
  // First determine if tickets are needed at all
  const needsGuideTickets = locationRequiresGuideTickets(location);
  
  if (!needsGuideTickets) {
    logger.debug(`🎟️ [CompleteCalculator] Location "${location}" doesn't require guide tickets, returning zero`);
    return {
      adultTickets: 0,
      childTickets: 0,
      totalTickets: 0,
      guides: []
    };
  }
  
  // Ensure tour groups is an array
  const validTourGroups = Array.isArray(tourGroups) ? tourGroups : [];
  
  // Find which guides are assigned
  const assignedGuideIds = findAssignedGuides(validTourGroups, guide1Info, guide2Info, guide3Info);
  
  logger.debug(`🎟️ [CompleteCalculator] Found ${assignedGuideIds.size} assigned guides: ${Array.from(assignedGuideIds).join(', ')}`);
  
  if (assignedGuideIds.size === 0) {
    // Check if we have guide1 (default guide) that needs to be included
    if (isDefaultGuide(guide1Info, needsGuideTickets)) {
      logger.debug(`🎟️ [CompleteCalculator] No assigned guides, but default guide1 exists:`, {
        guide1Name: guide1Info?.name,
        guide1Type: guide1Info?.guideType
      });
      
      // Process the default guide
      const guide1Req = processDefaultGuide(
        guide1Info,
        needsGuideTickets,
        "guide1",
        processGuideTicketRequirement
      );
      
      // If the guide needs a ticket, return that information
      if (guide1Req && guide1Req.needsTicket) {
        let adultTickets = guide1Req.ticketType === 'adult' ? 1 : 0;
        let childTickets = guide1Req.ticketType === 'child' ? 1 : 0;
        let totalTickets = adultTickets + childTickets;
        
        return {
          adultTickets,
          childTickets,
          totalTickets,
          guides: [{
            guideName: guide1Req.guideName,
            guideInfo: guide1Req.guideInfo,
            needsTicket: true,
            ticketType: guide1Req.ticketType
          }]
        };
      }
    }
    
    logger.debug(`🎟️ [CompleteCalculator] No assigned guides found, returning zero tickets`);
    return {
      adultTickets: 0,
      childTickets: 0,
      totalTickets: 0,
      guides: []
    };
  }
  
  // Calculate requirements for each guide
  const guide1Req = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Req = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Req = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Filter to only guides that need tickets
  const guidesWithRequirements = [
    guide1Req, guide2Req, guide3Req
  ].filter(g => g.needsTicket).map(g => ({
    guideName: g.guideName,
    guideInfo: g.guideInfo,
    needsTicket: g.needsTicket,
    ticketType: g.ticketType
  }));
  
  // Count tickets by type
  const { adultTickets, childTickets } = countTicketsByType(guidesWithRequirements);
  const totalTickets = adultTickets + childTickets;
  
  logger.debug(`🎟️ [CompleteCalculator] Final ticket requirements:`, {
    adultTickets,
    childTickets,
    totalTickets,
    guides: guidesWithRequirements.map(g => ({
      name: g.guideName,
      ticketType: g.ticketType
    }))
  });
  
  return {
    adultTickets,
    childTickets,
    totalTickets,
    guides: guidesWithRequirements
  };
};
