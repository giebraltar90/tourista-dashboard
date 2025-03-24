
// Export all utilities from this module for better organization
export { locationRequiresGuideTickets } from './locationUtils';
export { guideTypeNeedsTicket, determineTicketTypeForGuide } from './guideTypeUtils';
export { findAssignedGuides, processGuideTicketRequirement } from './guideTicketProcessor';
export { calculateCompleteTicketRequirements, calculateCompleteGuideTicketRequirements } from './core/completeCalculator';
