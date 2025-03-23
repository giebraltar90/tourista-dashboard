
import { VentrataTourGroup } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Recalculates all group sizes for consistency
 */
export const recalculateAllTourGroupSizes = (tourGroups: VentrataTourGroup[]): VentrataTourGroup[] => {
  logger.debug("PARTICIPANTS DEBUG: recalculateAllTourGroupSizes called with", {
    tourGroupsCount: tourGroups.length,
    groupDetails: tourGroups.map(g => ({
      id: g.id,
      name: g.name,
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0,
      currentSize: g.size, 
      currentChildCount: g.childCount
    }))
  });
  
  // Guard against invalid input
  if (!Array.isArray(tourGroups)) {
    logger.debug("PARTICIPANTS DEBUG: tourGroups is not an array, returning empty array");
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
        const participantCount = participant.count || 1;
        const participantChildCount = participant.childCount || 0;
        
        calculatedSize += participantCount;
        calculatedChildCount += participantChildCount;
        
        logger.debug(`PARTICIPANTS DEBUG: Recalculating for participant "${participant.name}": count=${participantCount}, childCount=${participantChildCount}`);
      }
      
      // Update the size and childCount properties
      updatedGroup.size = calculatedSize;
      updatedGroup.childCount = calculatedChildCount;
      
      logger.debug(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" recalculated: size=${calculatedSize}, childCount=${calculatedChildCount}`);
    } else {
      // If no participants, size should be 0
      updatedGroup.size = 0;
      updatedGroup.childCount = 0;
      
      logger.debug(`PARTICIPANTS DEBUG: Group "${updatedGroup.name || 'Unnamed'}" has no participants, setting size=0, childCount=0`);
    }
    
    return updatedGroup;
  });
};

/**
 * Creates test participants for debugging
 */
export const createTestParticipantsForTesting = (
  tourId: string, 
  groupId: string
): { count: number; child_count: number; name: string; booking_ref: string; }[] => {
  const participants = [
    {
      name: "Smith Family",
      count: 2,
      child_count: 1,
      booking_ref: `SM${Math.floor(Math.random() * 10000)}`
    },
    {
      name: "John Davis",
      count: 1,
      child_count: 0,
      booking_ref: `JD${Math.floor(Math.random() * 10000)}`
    },
    {
      name: "Rodriguez Family",
      count: 3,
      child_count: 1,
      booking_ref: `RF${Math.floor(Math.random() * 10000)}`
    }
  ];
  
  logger.debug(`PARTICIPANTS DEBUG: Created test participants for group ${groupId}:`, {
    tourId,
    groupId,
    participantsCount: participants.length,
    totalPeople: participants.reduce((sum, p) => sum + p.count, 0),
    totalChildren: participants.reduce((sum, p) => sum + p.child_count, 0)
  });
  
  return participants;
};
