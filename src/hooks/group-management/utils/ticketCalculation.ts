
// This file is now a re-export file that uses our new service module
import { 
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  getGuideTicketRequirement,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateGuideTicketsNeeded
} from '@/hooks/tour-details/services/ticketCalculationService';

// Re-export all the functions for backward compatibility
export {
  locationRequiresGuideTickets,
  guideTypeNeedsTicket,
  determineTicketTypeForGuide,
  getGuideTicketRequirement,
  findAssignedGuides,
  processGuideTicketRequirement,
  calculateGuideTicketsNeeded
};
