
// Export all group management hooks from this index file
export { useGroupManagement } from './useGroupManagement';
export { useAddGroup } from './useAddGroup';
export { useUpdateGroup } from './useUpdateGroup';
export { useAssignGuide } from './useAssignGuide';
export { useDeleteGroup } from './useDeleteGroup';
export { useGuideNameInfo } from './useGuideNameInfo';

// Export utility functions for reuse
export { findGuideName, generateGroupName } from './utils/guideNameUtils';
