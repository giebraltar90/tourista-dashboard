
import { VentrataTourGroup } from "@/types/ventrata";

/**
 * Calculates the total number of participants across all groups
 */
export const calculateTotalParticipants = (tourGroups: VentrataTourGroup[]): number => {
  console.log("PARTICIPANTS DEBUG: calculateTotalParticipants called with", {
    tourGroupsCount: tourGroups.length,
    tourGroupsWithParticipants: tourGroups.filter(g => Array.isArray(g.participants) && g.participants.length > 0).length
  });
  
  // CRITICAL FIX: Only count from participants arrays, NEVER use size property
  let totalParticipants = 0;
  
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning 0");
    return 0;
  }
  
  // Process each group one by one
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      
      // Count directly from participants array for accurate totals
      for (const participant of group.participants) {
        const count = participant.count || 1;
        groupTotal += count;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" count ${count} to total`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" total participants: ${groupTotal}`);
      totalParticipants += groupTotal;
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
    }
    // CRITICAL FIX: Completely remove fallback to group.size
  }
  
  console.log("PARTICIPANTS DEBUG: calculateTotalParticipants final result:", totalParticipants);
  return totalParticipants;
};

/**
 * Calculates the total number of children across all groups
 */
export const calculateTotalChildCount = (tourGroups: VentrataTourGroup[]): number => {
  console.log("PARTICIPANTS DEBUG: calculateTotalChildCount called with", {
    tourGroupsCount: tourGroups.length,
    tourGroupsWithParticipants: tourGroups.filter(g => Array.isArray(g.participants) && g.participants.length > 0).length
  });
  
  // CRITICAL FIX: Only count from participants arrays, NEVER use childCount property
  let totalChildCount = 0;
  
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning 0");
    return 0;
  }
  
  // Process each group one by one
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupChildCount = 0;
      
      // Count directly from participants array
      for (const participant of group.participants) {
        const childCount = participant.childCount || 0;
        groupChildCount += childCount;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" childCount ${childCount} to total`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" total children: ${groupChildCount}`);
      totalChildCount += groupChildCount;
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array or it's empty`);
    }
    // CRITICAL FIX: Completely remove fallback to group.childCount
  }
  
  console.log("PARTICIPANTS DEBUG: calculateTotalChildCount final result:", totalChildCount);
  return totalChildCount;
};
