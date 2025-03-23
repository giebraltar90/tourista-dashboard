
// Re-export all ticket calculation utilities from one central file
export { locationRequiresGuideTickets } from './locationUtils';
export { guideTypeNeedsTicket, determineTicketTypeForGuide } from './guideTypeUtils';
export { getGuideTicketRequirement } from './guideRequirementUtils';
export { findAssignedGuides } from './guideAssignmentUtils';
export { processGuideTicketRequirement } from './guideTicketProcessor';

// New core module exports
export { 
  isDefaultGuide, 
  processDefaultGuide,
  countTicketsByType,
  mapGuidesToResultFormat,
  calculateBasicGuideTickets,
  calculateCompleteTicketRequirements
} from './core';

// Main calculator functions (now thin wrappers)
export { 
  calculateGuideTicketsNeeded, 
  calculateCompleteGuideTicketRequirements 
} from './ticketCalculator';
