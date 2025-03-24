
/**
 * Service for counting participants in tour groups
 */

export const calculateTotalParticipants = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};

export const calculateTotalChildCount = (groups: any[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.childCount || group.child_count || 0);
  }, 0);
};

export const calculateAdultCount = (totalParticipants: number, childCount: number): number => {
  return Math.max(0, totalParticipants - childCount);
};

export const formatParticipantCounts = (
  totalParticipants: number, 
  childCount: number
): string => {
  const adultCount = calculateAdultCount(totalParticipants, childCount);
  return `${adultCount} adults + ${childCount} children`;
};
