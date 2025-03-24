
/**
 * Re-export participant service functions for backward compatibility
 */
import { formatParticipantCount } from "../services/participantService";
import { calculateTotalParticipants } from "../services/participantService";

// Re-export for backward compatibility
export { formatParticipantCount, calculateTotalParticipants };

// Add a new implementation of calculateTotalParticipants in case it's missing from the service
export const calculateGroupsTotal = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};
