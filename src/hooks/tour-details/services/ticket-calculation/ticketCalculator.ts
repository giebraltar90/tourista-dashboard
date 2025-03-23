
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
    logger.debug(`🎟️ [CalculateTickets] Location "${location}" doesn't require guide tickets, returning zero`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Ensure tour groups is an array
  const validTourGroups = Array.isArray(tourGroups) ? tourGroups : [];
  
  // Detailed logging of input data
  logger.debug(`🎟️ [CalculateTickets] Starting calculation with:`, {
    groupCount: validTourGroups.length,
    location,
    guide1: guide1Info ? {
      id: guide1Info.id || 'unknown',
      name: guide1Info.name || 'unnamed',
      type: guide1Info.guideType || 'unknown'
    } : 'none',
    guide2: guide2Info ? {
      id: guide2Info.id || 'unknown',
      name: guide2Info.name || 'unnamed',
      type: guide2Info.guideType || 'unknown'
    } : 'none',
    guide3: guide3Info ? {
      id: guide3Info.id || 'unknown',
      name: guide3Info.name || 'unnamed',
      type: guide3Info.guideType || 'unknown'
    } : 'none',
  });
  
  // Find assigned guides and log results
  const assignedGuideIds = findAssignedGuides(validTourGroups, guide1Info, guide2Info, guide3Info);
  logger.debug(`🎟️ [CalculateTickets] Found ${assignedGuideIds.size} assigned guides: ${Array.from(assignedGuideIds).join(', ') || 'none'}`);
  
  if (assignedGuideIds.size === 0) {
    // Check if we have guide1 (default guide) that needs to be included
    if (guide1Info && locationRequiresGuideTickets(location)) {
      logger.debug(`🎟️ [CalculateTickets] No assigned guides, but default guide1 exists:`, {
        guide1Name: guide1Info.name,
        guide1Type: guide1Info.guideType
      });
      
      // Process the default guide
      const guide1Result = processGuideTicketRequirement(
        guide1Info, 
        location, 
        new Set(["guide1"]), // Mark guide1 as "assigned" for this calculation
        "guide1"
      );
      
      return calculateGuideTickets([guide1Result]);
    }
    
    logger.debug(`🎟️ [CalculateTickets] No assigned guides found, returning zero tickets`);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }
  
  // Process each guide
  const guide1Result = processGuideTicketRequirement(guide1Info, location, assignedGuideIds, "guide1");
  const guide2Result = processGuideTicketRequirement(guide2Info, location, assignedGuideIds, "guide2");
  const guide3Result = processGuideTicketRequirement(guide3Info, location, assignedGuideIds, "guide3");
  
  // Detailed logging for each guide's ticket requirements
  logger.debug(`🎟️ [CalculateTickets] Individual guide ticket requirements:`, {
    guide1: {
      name: guide1Result.guideName,
      isAssigned: assignedGuideIds.has("guide1"),
      needsTicket: guide1Result.needsTicket,
      ticketType: guide1Result.ticketType,
      guideType: guide1Info?.guideType || 'unknown'
    },
    guide2: {
      name: guide2Result.guideName,
      isAssigned: assignedGuideIds.has("guide2"),
      needsTicket: guide2Result.needsTicket,
      ticketType: guide2Result.ticketType,
      guideType: guide2Info?.guideType || 'unknown'
    },
    guide3: {
      name: guide3Result.guideName,
      isAssigned: assignedGuideIds.has("guide3"),
      needsTicket: guide3Result.needsTicket,
      ticketType: guide3Result.ticketType,
      guideType: guide3Info?.guideType || 'unknown'
    }
  });
  
  // Calculate total tickets needed
  const result = calculateGuideTickets([guide1Result, guide2Result, guide3Result]);
  
  // Final count check
  logger.debug(`🎟️ [CalculateTickets] Final guide ticket counts:`, {
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
  logger.debug(`🎟️ [GuideRequirements] Starting complete calculation for location "${location}"`);
  
  // First determine if tickets are needed at all
  const needsGuideTickets = locationRequiresGuideTickets(location);
  
  if (!needsGuideTickets) {
    logger.debug(`🎟️ [GuideRequirements] Location "${location}" doesn't require guide tickets, returning zero`);
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
  
  logger.debug(`🎟️ [GuideRequirements] Found ${assignedGuideIds.size} assigned guides: ${Array.from(assignedGuideIds).join(', ')}`);
  
  if (assignedGuideIds.size === 0) {
    // Check if we have guide1 (default guide) that needs to be included
    if (guide1Info && locationRequiresGuideTickets(location)) {
      logger.debug(`🎟️ [GuideRequirements] No assigned guides, but default guide1 exists:`, {
        guide1Name: guide1Info.name,
        guide1Type: guide1Info.guideType
      });
      
      // Process the default guide
      const guide1Req = processGuideTicketRequirement(
        guide1Info, 
        location, 
        new Set(["guide1"]), // Mark guide1 as "assigned" for this calculation
        "guide1"
      );
      
      // If the guide needs a ticket, return that information
      if (guide1Req.needsTicket) {
        let adultTickets = guide1Req.ticketType === 'adult' ? 1 : 0;
        let childTickets = guide1Req.ticketType === 'child' ? 1 : 0;
        
        return {
          adultTickets,
          childTickets,
          totalTickets: adultTickets + childTickets,
          guides: [{
            guideName: guide1Req.guideName,
            guideInfo: guide1Req.guideInfo,
            needsTicket: true,
            ticketType: guide1Req.ticketType
          }]
        };
      }
    }
    
    logger.debug(`🎟️ [GuideRequirements] No assigned guides found, returning zero tickets`);
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
  
  const total = adultTickets + childTickets;
  
  logger.debug(`🎟️ [GuideRequirements] Final ticket requirements:`, {
    adultTickets,
    childTickets,
    totalTickets: total,
    guides: guidesWithRequirements.map(g => ({
      name: g.guideName,
      ticketType: g.ticketType
    }))
  });
  
  return {
    adultTickets,
    childTickets,
    totalTickets: total,
    guides: guidesWithRequirements
  };
};
