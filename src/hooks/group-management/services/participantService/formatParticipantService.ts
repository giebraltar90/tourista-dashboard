
import { toast } from "sonner";

/**
 * Format the participant count to show adults + children if there are children
 */
export const formatParticipantCount = (totalParticipants: number, childCount: number) => {
  console.log("PARTICIPANTS DEBUG: formatParticipantCount called with", {
    totalParticipants,
    childCount
  });
  
  // Ensure we're working with valid numbers
  const validTotal = isNaN(totalParticipants) ? 0 : Math.max(0, totalParticipants);
  const validChildCount = isNaN(childCount) ? 0 : Math.max(0, childCount);
  
  // Calculate adult count
  const adultCount = Math.max(0, validTotal - validChildCount);
  
  if (validChildCount > 0) {
    console.log(`PARTICIPANTS DEBUG: Formatting as adults+children: ${adultCount}+${validChildCount}`);
    return `${adultCount}+${validChildCount}`;
  } else {
    console.log(`PARTICIPANTS DEBUG: Formatting as just total: ${validTotal}`);
    return `${validTotal}`;
  }
};
