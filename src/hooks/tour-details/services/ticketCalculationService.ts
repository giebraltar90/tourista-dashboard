
// This file is now a re-export file that uses our modular ticket calculation system
import { 
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  getGuideTicketRequirement,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateGuideTickets,
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
} from './ticket-calculation';

// Re-export all functions from modular system
export {
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  getGuideTicketRequirement,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateGuideTickets,
  calculateGuideTicketsNeeded,
  calculateCompleteGuideTicketRequirements
};
