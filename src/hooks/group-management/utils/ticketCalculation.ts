
// This file is now a re-export file that uses our new service module
import { 
  doesLocationRequireGuideTickets,
  needsTicketForGuideType,
  determineTicketType,
  getGuideTicketRequirement,
  findAssignedGuidesForTour,
  processGuideTickets,
  calculateGuideTicketsNeeded,
  calculateCompleteTicketRequirements
} from '@/hooks/tour-details/services/ticketCalculationService';

// Re-export all the functions for backward compatibility
export {
  doesLocationRequireGuideTickets as locationRequiresGuideTickets,
  needsTicketForGuideType as guideTypeNeedsTicket,
  determineTicketType as determineTicketTypeForGuide,
  getGuideTicketRequirement,
  findAssignedGuidesForTour as findAssignedGuides,
  processGuideTickets as processGuideTicketRequirement,
  calculateGuideTicketsNeeded,
  calculateCompleteTicketRequirements as calculateCompleteGuideTicketRequirements
};
