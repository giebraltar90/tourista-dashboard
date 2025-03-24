
/**
 * Re-export participant service functions for backward compatibility
 */
import { formatParticipantCount } from "../services/participantService/formatParticipantService";

// Export the formatParticipantCount function for formatting participant counts
export { formatParticipantCount };

// Add a new implementation of calculateTotalParticipants
export const calculateTotalParticipants = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};

// Add a function to calculate total child count
export const calculateTotalChildCount = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.childCount || group.child_count || 0);
  }, 0);
};

// Another implementation for calculating group totals
export const calculateGroupsTotal = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};
