
// Export all ticket calculation utilities from this central location
export { locationRequiresGuideTickets } from './locationUtils';
export { guideTypeNeedsTicket, determineTicketTypeForGuide } from './guideTypeUtils';
export { getGuideTicketRequirement } from './guideRequirementUtils';
export { findAssignedGuides } from './guideAssignmentUtils';
export { processGuideTicketRequirement } from './guideTicketProcessor';
export { calculateCompleteTicketRequirements } from './core/completeCalculator';

// Export from the ticketCalculator for backwards compatibility
export { calculateGuideTicketsNeeded, calculateCompleteGuideTicketRequirements } from './ticketCalculator';
