
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketCounts } from "../../utils/guideTicketTypes";
import { locationRequiresGuideTickets } from "./locationUtils";
import { findAssignedGuides } from "./guideAssignmentUtils";
import { processGuideTicketRequirement } from "./guideTicketProcessor";
import { calculateGuideTickets } from "./guideTicketProcessor";

/**
 * Calculate how many tickets are needed for all guides on a tour
 */
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> } => {
  // Skip ticket calculation if location doesn't require tickets
  if (!locationRequiresGuideTickets(location)) {
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Log the inputs for debugging
  logger.debug(`🎟️ [CalculateTickets] Starting calculation with:`, {
    location,
    guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'none',
    guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'none', 
    guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'none',
    groupCount: tourGroups.length,
    groupDetails: tourGroups.map(g => ({
      id: g.id,
      name: g.name,
      guideId: g.guideId,
      guideName: g.guideName
    }))
  });
  
  // Find assigned guides
  const assignedGuideIds = findAssignedGuides(tourGroups, guide1Info, guide2Info, guide3Info);
  logger.debug(`🎟️ [CalculateTickets] Found assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  
  if (assignedGuideIds.size === 0) {
    logger.debug(`🎟️ [CalculateTickets] No assigned guides found, returning zero tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Process each guide
  const guide1Result = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Result = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Result = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Log individual guide requirements
  logger.debug(`🎟️ [CalculateTickets] Guide requirements:`, {
    guide1: guide1Result.needsTicket ? `Needs ${guide1Result.ticketType} ticket` : 'No ticket needed',
    guide2: guide2Result.needsTicket ? `Needs ${guide2Result.ticketType} ticket` : 'No ticket needed',
    guide3: guide3Result.needsTicket ? `Needs ${guide3Result.ticketType} ticket` : 'No ticket needed'
  });
  
  // Calculate total tickets needed
  const result = calculateGuideTickets([guide1Result, guide2Result, guide3Result]);
  
  // Final count check
  logger.debug("🎟️ [CalculateTickets] Final guide ticket counts", {
    adultTickets: result.adultTickets,
    childTickets: result.childTickets,
    guidesWithTickets: result.guides.length,
    assignedGuideCount: assignedGuideIds.size,
    guideDetails: result.guides.map(g => `${g.guideName} (${g.guideType}): ${g.ticketType || 'No ticket'}`)
  });
  
  return result;
};

/**
 * Calculate complete ticket requirements for guides including counts
 */
export const calculateCompleteGuideTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[]
): GuideTicketCounts => {
  // First determine if tickets are needed at all
  const needsGuideTickets = locationRequiresGuideTickets(location);
  
  if (!needsGuideTickets) {
    return {
      adultTickets: 0,
      childTickets: 0,
      totalTickets: 0,
      guides: []
    };
  }
  
  // Find which guides are assigned
  const assignedGuideIds = findAssignedGuides(tourGroups, guide1Info, guide2Info, guide3Info);
  
  if (assignedGuideIds.size === 0) {
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
  let adultTickets = 0;
  let childTickets = 0;
  
  guidesWithRequirements.forEach(guide => {
    if (guide.ticketType === 'adult') adultTickets++;
    else if (guide.ticketType === 'child') childTickets++;
  });
  
  return {
    adultTickets,
    childTickets,
    totalTickets: adultTickets + childTickets,
    guides: guidesWithRequirements
  };
};
