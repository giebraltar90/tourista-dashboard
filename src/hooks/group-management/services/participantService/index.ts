
// Re-export individual modules without creating ambiguous exports
export * from './movementService';
export * from './countingService';
export * from './syncService';
export * from './recalculationService';

// Explicitly re-export formatParticipantService functions to avoid ambiguity
import { formatParticipantCount } from './formatParticipantService';
export { formatParticipantCount };

// Export any other named exports from formatParticipantService if needed
// import { otherFunction } from './formatParticipantService';
// export { otherFunction };
