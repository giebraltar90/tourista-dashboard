
/**
 * Entry point for the participant service
 * Re-exports functionality from specialized submodules
 */

// Export sync-related functionality
export { 
  syncTourData, 
  syncTourGroupSizes, 
  ensureSyncFunction,
  updateGroupGuideDirectly
} from './sync';

// Export counting and formatting utilities
export { 
  calculateTotalParticipants,
  calculateTotalChildCount,
  calculateAdultCount,
  formatParticipantCounts
} from './countingService';

export { 
  formatParticipantCount, 
  formatParticipantCountShort 
} from './formatParticipantService';

// Export movement-related functionality
export {
  moveParticipant,
  updateParticipantGroupInDatabase
} from './movementService';

// Define a useParticipantService hook for backward compatibility
export const useParticipantService = () => {
  // This is a simplified version for compatibility
  const moveParticipant = async (participantId: string, sourceGroupId: string, targetGroupId: string) => {
    console.log("Mock moveParticipant called", { participantId, sourceGroupId, targetGroupId });
    return { success: true, message: "Operation simulated" };
  };
  
  const recalculateGroupSizes = async (tourId: string) => {
    console.log("Mock recalculateGroupSizes called for tour", tourId);
    return { success: true };
  };
  
  const fetchParticipantsForGroup = async (groupId: string) => {
    console.log("Mock fetchParticipantsForGroup called for group", groupId);
    return [];
  };
  
  const getParticipantCounts = (groups: any[]) => {
    const totalParticipants = groups.reduce((sum, group) => sum + (group.size || 0), 0);
    const totalChildCount = groups.reduce((sum, group) => sum + (group.childCount || 0), 0);
    const adultCount = totalParticipants - totalChildCount;
    
    return {
      totalParticipants,
      totalChildCount,
      adultCount,
      formatParticipantCount: (total: number, children: number) => 
        `${total - children} adults + ${children} children`
    };
  };
  
  return {
    moveParticipant,
    recalculateGroupSizes,
    fetchParticipantsForGroup,
    getParticipantCounts
  };
};
