
/**
 * Format participant count to show adults+children
 */
export const formatParticipantCount = (
  totalParticipants: number, 
  childCount: number
): string => {
  if (totalParticipants === 0) return "0";
  
  const adultCount = totalParticipants - childCount;
  
  if (childCount === 0) {
    return `${totalParticipants}`;
  }
  
  return `${adultCount} + ${childCount}`;
};
