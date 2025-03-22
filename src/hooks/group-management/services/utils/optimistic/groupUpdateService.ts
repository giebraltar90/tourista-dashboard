
/**
 * Updates tour groups in the cache by replacing groups with the updated version
 * while preserving any participants data
 */
export const updateTourGroupsById = (oldData: any, updatedGroups: any[]): any => {
  if (!oldData || !oldData.tourGroups || !Array.isArray(updatedGroups)) {
    return oldData;
  }
  
  // Make a deep copy of old data to avoid mutation issues
  const newData = JSON.parse(JSON.stringify(oldData));
  
  // For each updated group, find matching group in old data and replace it
  updatedGroups.forEach(updatedGroup => {
    const groupIndex = newData.tourGroups.findIndex((g: any) => g.id === updatedGroup.id);
    
    if (groupIndex >= 0) {
      // Preserve participants data if not in updated group
      const existingParticipants = Array.isArray(newData.tourGroups[groupIndex].participants) 
        ? newData.tourGroups[groupIndex].participants 
        : [];
        
      const updatedParticipants = Array.isArray(updatedGroup.participants) 
        ? updatedGroup.participants 
        : existingParticipants;
      
      // Update the group with the new data
      newData.tourGroups[groupIndex] = {
        ...updatedGroup,
        participants: updatedParticipants
      };
    }
  });
  
  return newData;
};
