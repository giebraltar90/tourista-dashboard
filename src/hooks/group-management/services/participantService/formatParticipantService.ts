
/**
 * Format participant count into a readable string
 */
export const formatParticipantCount = (
  totalParticipants: number, 
  childCount: number
): string => {
  const adultCount = Math.max(0, totalParticipants - childCount);
  return `${adultCount} adults + ${childCount} children`;
};

/**
 * Format participant count into a short string
 */
export const formatParticipantCountShort = (
  totalParticipants: number, 
  childCount: number
): string => {
  const adultCount = Math.max(0, totalParticipants - childCount);
  return `${adultCount}A + ${childCount}C`;
};

/**
 * Export for backward compatibility - renamed to avoid duplicate export
 */
export const formatParticipantCounts = formatParticipantCount;
