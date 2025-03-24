
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";

// Define TicketRequirements interface
export interface TicketRequirements {
  locationNeedsGuideTickets: boolean;
  hasAssignedGuides: boolean;
  guideTickets: {
    adultTickets: number;
    childTickets: number;
    guides: Array<{
      guideName: string;
      guideType: string;
      ticketType: 'adult' | 'child' | null;
    }>;
  };
}

// Function to determine if a guide needs a ticket based on type and location
export const doesGuideNeedTicket = (
  guideType: string | undefined,
  location: string
): { needsTicket: boolean; ticketType: 'adult' | 'child' | null } => {
  if (!guideType) {
    return { needsTicket: false, ticketType: null };
  }
  
  // Guide type determines ticket requirements
  if (guideType.includes('GA Ticket')) {
    return { needsTicket: true, ticketType: 'adult' };
  }
  
  // Special locations where all guides need tickets
  if (location === 'Versailles' || location === 'Louvre') {
    return { needsTicket: true, ticketType: 'adult' };
  }
  
  return { needsTicket: false, ticketType: null };
};

// Function to check if a location requires guide tickets
export function doesLocationRequireGuideTickets(location: string): boolean {
  const locationsRequiringTickets = ['Versailles', 'Louvre', 'Disneyland', 'Eiffel Tower'];
  return locationsRequiringTickets.includes(location);
}

// Function to determine if a guide needs a ticket based on type
export function needsTicketForGuideType(guideType: string): boolean {
  return guideType === 'staff' || guideType === 'contractor';
}

// Function to determine the ticket type for a guide
export function determineTicketType(guide: GuideInfo | null | undefined): "adult" | "child" | null {
  if (!guide) return null;
  
  if (needsTicketForGuideType(guide.guideType)) {
    return "adult"; // Default to adult tickets for guides
  }
  
  return null;
}

// Comprehensive ticket calculation function
export function calculateCompleteTicketRequirements(
  guide1Info: GuideInfo | null, 
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[] = []
): TicketRequirements {
  // Check if any guides are assigned
  const hasAssignedGuides = !!(guide1Info || guide2Info || guide3Info);
  
  // Check if location requires guide tickets
  const locationNeedsGuideTickets = doesLocationRequireGuideTickets(location);
  
  // Initialize counts
  let adultTickets = 0;
  let childTickets = 0;
  const guidesWithTickets: {
    guideName: string;
    guideType: string;
    ticketType: 'adult' | 'child' | null;
  }[] = [];
  
  // Process guide1
  if (guide1Info) {
    const { needsTicket, ticketType } = doesGuideNeedTicket(guide1Info.guideType, location);
    if (needsTicket) {
      if (ticketType === 'adult') adultTickets++;
      if (ticketType === 'child') childTickets++;
      
      guidesWithTickets.push({
        guideName: guide1Info.name || 'Guide 1',
        guideType: guide1Info.guideType || 'Unknown',
        ticketType
      });
    }
  }
  
  // Process guide2
  if (guide2Info) {
    const { needsTicket, ticketType } = doesGuideNeedTicket(guide2Info.guideType, location);
    if (needsTicket) {
      if (ticketType === 'adult') adultTickets++;
      if (ticketType === 'child') childTickets++;
      
      guidesWithTickets.push({
        guideName: guide2Info.name || 'Guide 2',
        guideType: guide2Info.guideType || 'Unknown',
        ticketType
      });
    }
  }
  
  // Process guide3
  if (guide3Info) {
    const { needsTicket, ticketType } = doesGuideNeedTicket(guide3Info.guideType, location);
    if (needsTicket) {
      if (ticketType === 'adult') adultTickets++;
      if (ticketType === 'child') childTickets++;
      
      guidesWithTickets.push({
        guideName: guide3Info.name || 'Guide 3',
        guideType: guide3Info.guideType || 'Unknown',
        ticketType
      });
    }
  }
  
  // Also process guides assigned directly to groups
  if (tourGroups && tourGroups.length > 0) {
    tourGroups.forEach(group => {
      if (group.guideInfo && !guidesWithTickets.some(g => g.guideName === group.guideInfo.name)) {
        const { needsTicket, ticketType } = doesGuideNeedTicket(
          group.guideInfo.guideType, 
          location
        );
        
        if (needsTicket) {
          if (ticketType === 'adult') adultTickets++;
          if (ticketType === 'child') childTickets++;
          
          guidesWithTickets.push({
            guideName: group.guideInfo.name || 'Group Guide',
            guideType: group.guideInfo.guideType || 'Unknown',
            ticketType
          });
        }
      }
    });
  }
  
  logger.debug(`🎟️ [calculateTickets] Calculated for ${location}:`, {
    adultTickets,
    childTickets,
    guidesWithTickets
  });
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides,
    guideTickets: {
      adultTickets,
      childTickets,
      guides: guidesWithTickets
    }
  };
}
