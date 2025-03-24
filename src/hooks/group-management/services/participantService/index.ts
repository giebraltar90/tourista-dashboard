
// Export all utility functions from the participant service
export * from './syncService';
export * from './countingService';

// Selectively export from formatParticipantService to avoid duplicate export
export { 
  formatParticipantCount, 
  formatParticipantCountShort 
} from './formatParticipantService';

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
