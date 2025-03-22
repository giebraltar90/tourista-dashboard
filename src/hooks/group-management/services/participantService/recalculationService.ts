
import { VentrataTourGroup } from "@/types/ventrata";

/**
 * Recalculates all group sizes for consistency
 */
export const recalculateAllTourGroupSizes = (tourGroups: VentrataTourGroup[]): VentrataTourGroup[] => {
  console.log("PARTICIPANTS DEBUG: recalculateAllTourGroupSizes called with", {
    tourGroupsCount: tourGroups.length
  });
  
  // Guard against invalid input
  if (!Array.isArray(tourGroups)) {
    console.log("PARTICIPANTS DEBUG: tourGroups is not an array, returning empty array");
    return [];
  }
  
  // Process each group
  return tourGroups.map(group => {
    // Create a copy to avoid mutating the original
    const updatedGroup = {...group};
    
    if (Array.isArray(updatedGroup.participants) && updatedGroup.participants.length > 0) {
      let calculatedSize = 0;
      let calculatedChildCount = 0;
      
      // Calculate from participants
      for (const participant of updatedGroup.participants) {
        calculatedSize += participant.count || 1;
        calculatedChildCount += participant.childCount || 0;
        
        console.log(`PARTICIPANTS DEBUG: Recalculating for participant "${participant.name}": count=${participant.count || 1}, childCount=${participant.childCount || 0}`);
      }
      
      // Update the size and childCount properties
      updatedGroup.size = calculatedSize;
      updatedGroup.childCount = calculatedChildCount;
      
      console.log(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" recalculated: size=${calculatedSize}, childCount=${calculatedChildCount}`);
    } else {
      // If no participants, size should be 0
      updatedGroup.size = 0;
      updatedGroup.childCount = 0;
      
      console.log(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" has no participants, setting size=0, childCount=0`);
    }
    
    return updatedGroup;
  });
};
