
/**
 * Re-export persistence utilities from their dedicated service files
 * This file is maintained for backward compatibility
 */

export { performOptimisticUpdate } from './optimistic';
export { persistGuideAssignmentChanges } from './persistenceService';
export { handleUIUpdates } from './notificationService';

// Re-export participant service functionality
export { updateParticipantGroupInDatabase } from '../participantService/movementService';
