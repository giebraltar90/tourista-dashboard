
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
          console.log(`Optimistically updating group ${updatedGroup.id} at index ${groupIndex}:`, updatedGroup);
          newData.tourGroups[groupIndex] = updatedGroup;
        }
      });
    }
    
    console.log("Optimistic update applied to tour data:", newData);
    return newData;
  });
};
