
// Re-export all participant-related services from this barrel file
export { formatParticipantCount } from './formatParticipantService';
export { moveParticipant, mergeParticipants } from './participantMovementService';
export { syncTourGroupSizes, ensureSyncFunction } from './syncService';
export { getParticipantCounts } from './participantCountsService';

// Re-export the create and delete participant functions
export { createParticipant, deleteParticipant } from './participantMutationService';

// Dummy implementation of the useParticipantService hook
export const useParticipantService = () => {
  return {
    moveParticipant: async () => ({ success: false, error: 'Not implemented' }),
    createParticipant: async () => ({ success: false, error: 'Not implemented' }),
    deleteParticipant: async () => ({ success: false, error: 'Not implemented' }),
    createTestParticipants: async () => ({ success: false, error: 'Not implemented' }),
    loadParticipants: async () => ({ success: false, error: 'Not implemented' }),
    refreshParticipants: async () => ({ success: false, error: 'Not implemented' })
  };
};
