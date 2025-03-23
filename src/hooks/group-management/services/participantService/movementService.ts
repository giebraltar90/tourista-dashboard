
/**
 * Re-export participant movement functionality from the core module
 * This file is maintained for backward compatibility
 */
import { 
  moveParticipant as coreMovementService,
  updateParticipantGroupInDatabase as coreUpdateService
} from './core';

export const moveParticipant = coreMovementService;
export const updateParticipantGroupInDatabase = coreUpdateService;
