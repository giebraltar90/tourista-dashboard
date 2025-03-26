
// Export utility functions with more specific naming to avoid conflicts
export {
  findGuideName as findGuideNameForGroup,
  generateGroupNameWithGuide,
  createModificationDescription
} from './groupNaming';

export * from './guideAssignmentMapping';
export * from './guideAssignmentValidation';
export * from './participantPreservation';
export * from './databaseOperations';
export * from './optimisticUpdates';

// Re-export existing utilities with explicit naming to avoid conflicts
export { 
  processGuideIdForAssignment
} from './guideAssignmentUtils';

// Export guide info utilities
export { useGuideNameInfo } from './guideInfoUtils';

// Export guide name utilities with explicit naming
export {
  findGuideName as findGuideNameByTour,
  generateGroupName,
  getGuideNameForAssignment
} from './guideNameUtils';

// Export ticket calculation utilities
export {
  calculateGuideTicketsNeeded,
  getGuideTicketRequirement
} from './ticketCalculation';
