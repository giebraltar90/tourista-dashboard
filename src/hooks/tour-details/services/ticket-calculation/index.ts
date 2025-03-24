
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketCounts } from "../../utils/guideTicketTypes";

/**
 * Check if the location requires guide tickets
 */
export const locationRequiresGuideTickets = (location: string): boolean => {
  // Versailles and other specific locations require guide tickets
  const locationLower = location.toLowerCase();
  return locationLower.includes('versailles') || 
         locationLower.includes('louvre') || 
         locationLower.includes('chateau');
};

/**
 * Check if a guide type needs a ticket
 */
export const guideTypeNeedsTicket = (guideType: string): boolean => {
  if (!guideType) return false;
  
  const typeUpper = guideType.toUpperCase();
  return typeUpper.includes('TICKET') || 
         typeUpper.includes('FREE') || 
         typeUpper.includes('GA TICKET') || 
         typeUpper.includes('GA FREE');
};

/**
 * Determine if a guide needs adult or child ticket
 */
export const determineTicketTypeForGuide = (guideType: string): "adult" | "child" | null => {
  if (!guideType) return null;
  
  const typeUpper = guideType.toUpperCase();
  if (typeUpper.includes('FREE')) {
    // Free passes use child tickets
    return "child";
  } else if (guideTypeNeedsTicket(guideType)) {
    // Default to adult tickets for other ticket types
    return "adult";
  }
  
  // No ticket needed for this guide type
  return null;
};

/**
 * Get the ticket requirement for a specific guide
 */
export const getGuideTicketRequirement = (
  guideName: string | null | undefined,
  guideType: string | null | undefined
): { guideName: string; guideType: string; ticketType: "adult" | "child" | null } => {
  // Default values if info is missing
  const name = guideName || "Unknown Guide";
  const type = guideType || "GA Ticket";
  
  return {
    guideName: name,
    guideType: type,
    ticketType: determineTicketTypeForGuide(type)
  };
};

/**
 * Find guides assigned to a tour with guide info
 */
export const findAssignedGuides = (
  guide1Info: GuideInfo | null, 
  guide2Info: GuideInfo | null, 
  guide3Info: GuideInfo | null
): Array<{ guideName: string; guideType: string; ticketType: "adult" | "child" | null }> => {
  const guides = [];
  
  if (guide1Info && guide1Info.name) {
    guides.push(getGuideTicketRequirement(guide1Info.name, guide1Info.guideType));
  }
  
  if (guide2Info && guide2Info.name) {
    guides.push(getGuideTicketRequirement(guide2Info.name, guide2Info.guideType));
  }
  
  if (guide3Info && guide3Info.name) {
    guides.push(getGuideTicketRequirement(guide3Info.name, guide3Info.guideType));
  }
  
  return guides;
};

/**
 * Process the ticket requirement for an individual guide
 */
export const processGuideTicketRequirement = (
  guideRequirement: { guideName: string; guideType: string; ticketType: "adult" | "child" | null },
  adultTickets: number,
  childTickets: number
): { adultTickets: number; childTickets: number; guide: any } => {
  const { ticketType } = guideRequirement;
  
  let newAdultTickets = adultTickets;
  let newChildTickets = childTickets;
  
  if (ticketType === "adult") {
    newAdultTickets += 1;
  } else if (ticketType === "child") {
    newChildTickets += 1;
  }
  
  return {
    adultTickets: newAdultTickets,
    childTickets: newChildTickets,
    guide: guideRequirement
  };
};

/**
 * Calculate the basic guide tickets needed
 */
export const calculateBasicGuideTickets = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[] = []
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: "adult" | "child" | null }> } => {
  // Check if this location needs guide tickets
  const needsGuideTickets = locationRequiresGuideTickets(location);
  
  // If we don't need guide tickets, return zeroes
  if (!needsGuideTickets) {
    logger.debug("🎟️ [TicketCalculation] Location doesn't require guide tickets:", location);
    return { adultTickets: 0, childTickets: 0, guides: [] };
  }

  // Find guides assigned to the tour
  const assignedGuides = findAssignedGuides(guide1Info, guide2Info, guide3Info);
  
  // Calculate tickets needed for all guides
  let adultTickets = 0;
  let childTickets = 0;
  const guidesWithTickets = [];
  
  for (const guide of assignedGuides) {
    const result = processGuideTicketRequirement(guide, adultTickets, childTickets);
    adultTickets = result.adultTickets;
    childTickets = result.childTickets;
    guidesWithTickets.push(result.guide);
  }
  
  return {
    adultTickets,
    childTickets,
    guides: guidesWithTickets
  };
};

/**
 * Calculate complete ticket requirements including guide information
 */
export const calculateCompleteTicketRequirements = (
  tour: any,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
): GuideTicketCounts => {
  const location = tour?.location || "";
  const tourGroups = tour?.tourGroups || [];
  
  // Check if this location needs guide tickets
  const locationNeedsGuideTickets = locationRequiresGuideTickets(location);
  
  // Calculate basic guide tickets
  const { adultTickets, childTickets, guides } = calculateBasicGuideTickets(
    guide1Info, 
    guide2Info, 
    guide3Info, 
    location,
    tourGroups
  );
  
  return {
    locationNeedsGuideTickets,
    guideTickets: {
      adultTickets,
      childTickets,
      guides
    },
    hasAssignedGuides: guides.length > 0
  };
};
