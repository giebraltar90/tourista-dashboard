
/**
 * Re-export persistence utilities from their dedicated service files
 * This file is maintained for backward compatibility
 */

export { performOptimisticUpdate } from './optimisticUpdateService';
export { persistGuideAssignmentChanges } from './persistenceService';
export { handleUIUpdates } from './notificationService';
