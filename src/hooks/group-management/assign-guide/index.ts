
// Export all functions from sub-modules
export { resolveGroupId } from './resolveGroupId';
export { processGuideId } from './processGuideId';
export { prepareGroupName, createDisplayNameForGroup } from './createGroupName';
export { updateDatabase } from './updateDatabase';

// Re-export types
export * from './types';

// Export the hook directly
export { useAssignGuide } from './useAssignGuide';
