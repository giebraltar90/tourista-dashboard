
import { GuideInfo } from "@/types/ventrata";
import {
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateCompleteTicketRequirements as coreCalculateCompleteTicketRequirements
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

// Export our renamed function with the correct signature
export const calculateCompleteGuideTicketRequirements = coreCalculateCompleteTicketRequirements;

// Add these two functions that are expected by importers
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
) => {
  // Import the actual function from the core implementation
  const result = coreCalculateCompleteTicketRequirements(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
  
  return result.guideTickets;
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
