
// Export all utilities from this module for better organization
export { locationRequiresGuideTickets } from './locationUtils';
export { guideTypeNeedsTicket, determineTicketTypeForGuide } from './guideTypeUtils';
export { processGuideTicketRequirement } from './guideTicketProcessor';
export { calculateCompleteTicketRequirements, calculateCompleteGuideTicketRequirements } from './core/completeCalculator';

// Export the guide ticket processor utilities individually
export { findAssignedGuides } from './core/assignmentDetection';
