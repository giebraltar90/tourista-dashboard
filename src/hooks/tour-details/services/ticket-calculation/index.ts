
/**
 * Ticket Calculation Service
 * 
 * This module provides a centralized system for calculating ticket requirements
 * based on tour information, participants, and guide assignments.
 */

import { logger } from "@/utils/logger";

// Location checks
export const locationRequiresGuideTickets = (location: string): boolean => {
  if (!location) return false;
  
  const locationLower = location.toLowerCase();
  
  // Locations that require guide tickets
  return (
    locationLower.includes('colosseum') ||
    locationLower.includes('forum') ||
    locationLower.includes('palatine') ||
    locationLower.includes('vatican') ||
    locationLower.includes('gallery')
  );
};

// Guide type checks
export const guideTypeNeedsTicket = (guideType?: string): boolean => {
  if (!guideType) return false;
  
  const typeLower = guideType.toLowerCase();
  
  // Guide types that need tickets
  return !(
    typeLower.includes('external') ||
    typeLower.includes('partner') ||
    typeLower.includes('self-guided')
  );
};

// Determine ticket type based on guide information
export const determineTicketTypeForGuide = (guideInfo: any): 'adult' | 'child' | null => {
  if (!guideInfo) return null;
  
  // Check if guide has a specific ticket type override
  if (guideInfo.ticketType === 'child') return 'child';
  if (guideInfo.ticketType === 'adult') return 'adult';
  
  // Default is adult ticket for most guide types
  return 'adult';
};

// Get ticket requirement for a specific guide
export const getGuideTicketRequirement = (
  guideName: string | undefined,
  guideInfo: any,
  locationRequiresTickets: boolean
): { needsTicket: boolean; ticketType: 'adult' | 'child' | null } => {
  // No guide, no ticket needed
  if (!guideName) {
    return { needsTicket: false, ticketType: null };
  }
  
  // If location doesn't require tickets, no need to continue
  if (!locationRequiresTickets) {
    return { needsTicket: false, ticketType: null };
  }
  
  // Check if guide type needs a ticket
  const needsTicket = guideTypeNeedsTicket(guideInfo?.guideType);
  
  // Determine ticket type if needed
  const ticketType = needsTicket ? determineTicketTypeForGuide(guideInfo) : null;
  
  return { needsTicket, ticketType };
};

// Find all guides assigned to groups
export const findAssignedGuides = (tour: any, guide1Info: any, guide2Info: any, guide3Info: any) => {
  const assignedGuides = [];
  
  // Check main guides
  if (tour.guide1) {
    assignedGuides.push({
      guideName: tour.guide1,
      guideId: "guide1",
      guideType: guide1Info?.guideType || "Unknown",
      guideInfo: guide1Info
    });
  }
  
  if (tour.guide2) {
    assignedGuides.push({
      guideName: tour.guide2,
      guideId: "guide2",
      guideType: guide2Info?.guideType || "Unknown",
      guideInfo: guide2Info
    });
  }
  
  if (tour.guide3) {
    assignedGuides.push({
      guideName: tour.guide3,
      guideId: "guide3",
      guideType: guide3Info?.guideType || "Unknown",
      guideInfo: guide3Info
    });
  }
  
  return assignedGuides;
};

// Process a single guide's ticket requirement
export const processGuideTicketRequirement = (
  guide: any,
  locationRequiresTickets: boolean
) => {
  // Get ticket requirements for this guide
  const { needsTicket, ticketType } = getGuideTicketRequirement(
    guide.guideName,
    guide.guideInfo,
    locationRequiresTickets
  );
  
  if (!needsTicket) {
    return {
      guideName: guide.guideName,
      guideType: guide.guideType,
      needsTicket: false,
      ticketType: null
    };
  }
  
  return {
    guideName: guide.guideName,
    guideType: guide.guideType,
    needsTicket: true,
    ticketType
  };
};

// Calculate the number of guide tickets needed
export const calculateGuideTicketsNeeded = (
  assignedGuides: any[],
  locationRequiresTickets: boolean
) => {
  let adultTickets = 0;
  let childTickets = 0;
  const guidesWithTickets = [];
  
  // Process each guide
  for (const guide of assignedGuides) {
    const requirement = processGuideTicketRequirement(guide, locationRequiresTickets);
    
    if (requirement.needsTicket) {
      if (requirement.ticketType === 'adult') {
        adultTickets++;
      } else if (requirement.ticketType === 'child') {
        childTickets++;
      }
      
      guidesWithTickets.push({
        guideName: requirement.guideName,
        guideType: requirement.guideType,
        ticketType: requirement.ticketType
      });
    }
  }
  
  return {
    adultTickets,
    childTickets,
    totalGuideTickets: adultTickets + childTickets,
    guides: guidesWithTickets
  };
};

// Calculate complete guide ticket requirements
export const calculateCompleteGuideTicketRequirements = (
  tour: any,
  guide1Info: any,
  guide2Info: any,
  guide3Info: any
) => {
  // Early return if no tour data
  if (!tour) {
    return {
      locationNeedsGuideTickets: false,
      hasAssignedGuides: false,
      guideTickets: {
        adultTickets: 0,
        childTickets: 0,
        totalGuideTickets: 0,
        guides: []
      }
    };
  }
  
  // Check if this location requires guide tickets
  const locationNeedsGuideTickets = locationRequiresGuideTickets(tour.location);
  
  // Find all assigned guides
  const assignedGuides = findAssignedGuides(tour, guide1Info, guide2Info, guide3Info);
  const hasAssignedGuides = assignedGuides.length > 0;
  
  // Calculate guide ticket requirements
  const guideTickets = calculateGuideTicketsNeeded(assignedGuides, locationNeedsGuideTickets);
  
  // Log for debugging
  logger.debug(`🎟️ [TicketCalculation] Guide ticket requirements for ${tour.id}:`, {
    location: tour.location,
    locationNeedsGuideTickets,
    hasAssignedGuides,
    assignedGuidesCount: assignedGuides.length,
    ...guideTickets
  });
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets
  };
};
