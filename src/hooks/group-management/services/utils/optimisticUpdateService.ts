
import { QueryClient } from "@tanstack/react-query";

/**
 * Applies an optimistic update to the UI cache
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a deep copy to avoid reference issues
    const newData = JSON.parse(JSON.stringify(oldData));
    
    // Apply updated groups by matching IDs instead of simple array replacement
    if (Array.isArray(updatedGroups) && Array.isArray(newData.tourGroups)) {
      updatedGroups.forEach(updatedGroup => {
        // Find the matching group by ID and update it
        const groupIndex = newData.tourGroups.findIndex((g: any) => g.id === updatedGroup.id);
        if (groupIndex !== -1) {
          console.log(`PARTICIPANTS PRESERVATION: Optimistically updating group ${updatedGroup.id} at index ${groupIndex}:`, {
            currentParticipantsCount: Array.isArray(newData.tourGroups[groupIndex].participants) 
              ? newData.tourGroups[groupIndex].participants.length 
              : 0,
            updatedParticipantsCount: Array.isArray(updatedGroup.participants) 
              ? updatedGroup.participants.length 
              : 0,
            currentSize: newData.tourGroups[groupIndex].size,
            updatedSize: updatedGroup.size,
            currentChildCount: newData.tourGroups[groupIndex].childCount,
            updatedChildCount: updatedGroup.childCount
          });
          
          // Preserve participants if they would be lost
          const shouldPreserveParticipants = 
            Array.isArray(newData.tourGroups[groupIndex].participants) && 
            newData.tourGroups[groupIndex].participants.length > 0 &&
            (!Array.isArray(updatedGroup.participants) || updatedGroup.participants.length === 0);
            
          // Create a new object with updated properties
          const mergedGroup = {
            ...newData.tourGroups[groupIndex],
            ...updatedGroup
          };
          
          // Explicitly preserve participants if needed
          if (shouldPreserveParticipants) {
            console.log("PARTICIPANTS PRESERVATION: Preserving participants that would be lost in update");
            mergedGroup.participants = newData.tourGroups[groupIndex].participants;
          }
          
          // Update the group in the cache
          newData.tourGroups[groupIndex] = mergedGroup;
          
          console.log(`PARTICIPANTS PRESERVATION: Group after optimistic update:`, {
            id: mergedGroup.id,
            name: mergedGroup.name,
            participantsCount: Array.isArray(mergedGroup.participants) 
              ? mergedGroup.participants.length 
              : 0,
            size: mergedGroup.size,
            childCount: mergedGroup.childCount
          });
        }
      });
    }
    
    console.log("PARTICIPANTS PRESERVATION: Optimistic update applied to tour data:", {
      tourId: newData.id,
      groupsCount: newData.tourGroups?.length || 0,
      groups: newData.tourGroups?.map((g: any) => ({
        id: g.id,
        name: g.name,
        participantsCount: Array.isArray(g.participants) ? g.participants.length : 0,
        size: g.size,
        childCount: g.childCount
      }))
    });
    
    return newData;
  });
};
