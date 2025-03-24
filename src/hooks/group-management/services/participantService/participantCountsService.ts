import { VentrataTourGroup } from "@/types/ventrata";

/**
 * Get participant counts from tour groups
 */
export const getParticipantCounts = (groups: VentrataTourGroup[]) => {
  let totalParticipants = 0;
  let childCount = 0;
  
  if (Array.isArray(groups)) {
    for (const group of groups) {
      // Use the participants array if it exists
      if (Array.isArray(group.participants) && group.participants.length > 0) {
        for (const participant of group.participants) {
          totalParticipants += participant.count || 1;
          childCount += participant.childCount || 0;
        }
      } else if (group.size) {
        // Otherwise use the size property
        totalParticipants += group.size;
        childCount += group.childCount || 0;
      }
    }
  }
  
  return {
    totalParticipants,
    childCount,
    adultCount: totalParticipants - childCount
  };
};
