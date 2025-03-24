
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
  processGuideTicketRequirement,
  calculateCompleteGuideTicketRequirements
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
  
  return calculateCompleteGuideTicketRequirements(
    participantAdultCount,
    participantChildCount,
    guideAdultTickets,
    guideChildTickets
  );
}
