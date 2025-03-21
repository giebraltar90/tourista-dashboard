
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

// Re-export existing utilities - these already contain a 'findGuideName' function
// which is causing the conflict, so we need to be explicit about what we export
export { 
  processGuideIdForAssignment,
  findGuideUuidByName
} from './guideAssignmentUtils';

export {
  findGuideName as findGuideNameFromInfo
} from './guideInfoUtils';

export {
  findGuideName as findGuideNameByTour,
  generateGroupName,
  getGuideNameForAssignment
} from './guideNameUtils';
