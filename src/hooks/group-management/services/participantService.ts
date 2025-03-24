
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

// Add other participant service functions here as needed
