
import { GuideInfo } from "@/types/ventrata";
import {
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateCompleteGuideTicketRequirements
} from "@/hooks/tour-details/services/ticket-calculation";
import { TicketRequirements } from "@/hooks/tour-details/types";

// Export utility functions to maintain API compatibility
export {
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  findAssignedGuides,
  processGuideTicketRequirement
};

// Export the renamed function with correct signature
export const calculateCompleteTicketRequirements = calculateCompleteGuideTicketRequirements;

// Add these two functions that are expected by importers with correct signatures
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = ""
) => {
  // Check if the location requires guide tickets
  if (!locationRequiresGuideTickets(location)) {
    return { adultTickets: 0, childTickets: 0 };
  }
  
  // Count tickets needed for each guide
  let adultTickets = 0;
  let childTickets = 0;
  
  // Process guide1
  if (guide1Info) {
    const ticketType = determineTicketTypeForGuide(guide1Info);
    if (ticketType === "adult") adultTickets++;
    else if (ticketType === "child") childTickets++;
  }
  
  // Process guide2
  if (guide2Info) {
    const ticketType = determineTicketTypeForGuide(guide2Info);
    if (ticketType === "adult") adultTickets++;
    else if (ticketType === "child") childTickets++;
  }
  
  // Process guide3
  if (guide3Info) {
    const ticketType = determineTicketTypeForGuide(guide3Info);
    if (ticketType === "adult") adultTickets++;
    else if (ticketType === "child") childTickets++;
  }
  
  return { adultTickets, childTickets };
};

export const getGuideTicketRequirement = (
  guideInfo: GuideInfo | null | undefined,
  location: string = ""
): { needsTicket: boolean; ticketType: "adult" | "child" | null } => {
  if (!guideInfo) return { needsTicket: false, ticketType: null };
  
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  const ticketType = determineTicketTypeForGuide(guideInfo);
  
  return { needsTicket, ticketType };
};

// Add any additional ticket calculation utilities specific to group management here
export function calculateTicketsForGroup(
  groupData: any,
  guides: GuideInfo[],
  location: string
): TicketRequirements {
  // Example implementation - replace with actual logic
  const participantAdultCount = (groupData.size || 0) - (groupData.childCount || 0);
  const participantChildCount = groupData.childCount || 0;
  
  // Calculate guide tickets
  let guideAdultTickets = 0;
  let guideChildTickets = 0;
  
  if (locationRequiresGuideTickets(location)) {
    for (const guide of guides) {
      const ticketType = determineTicketTypeForGuide(guide);
      if (ticketType === "adult") {
        guideAdultTickets++;
      } else if (ticketType === "child") {
        guideChildTickets++;
      }
    }
  }
  
  return {
    participantAdultCount,
    participantChildCount,
    guideAdultTickets,
    guideChildTickets,
    totalTicketsRequired: participantAdultCount + participantChildCount + guideAdultTickets + guideChildTickets
  };
}
