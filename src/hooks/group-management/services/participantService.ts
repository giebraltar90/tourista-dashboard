
/**
 * Format the participant count to show adults + children
 */
export const formatParticipantCount = (
  totalParticipants: number,
  childCount: number
): string => {
  if (totalParticipants === 0) {
    return "No participants";
  }
  
  const adultCount = totalParticipants - childCount;
  
  if (childCount === 0) {
    return `${totalParticipants} adults`;
  }
  
  if (adultCount === 0) {
    return `${childCount} children`;
  }
  
  return `${adultCount} adults + ${childCount} children`;
};

/**
 * Calculate the total number of participants in tour groups
 */
export const calculateTotalParticipants = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};

/**
 * Create a hook for participant service
 */
export const useParticipantService = () => {
  // This is a stub implementation to fix type errors
  // The actual implementation would be in participantService/index.ts
  return {
    loadParticipants: async () => ({ success: false }),
    moveParticipant: async () => false,
    refreshParticipants: async () => true,
    isLoading: false,
    error: null,
    lastRefreshed: new Date()
  };
};

// Add other participant service functions here as needed
