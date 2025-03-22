
import { QueryClient } from "@tanstack/react-query";

/**
 * Updates the tour data in the query cache for optimistic UI updates
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient, 
  tourId: string, 
  updatedGroups: any[]
): void => {
  if (!queryClient || !tourId) {
    console.error("Cannot perform optimistic update: Missing query client or tour ID");
    return;
  }
  
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a new object to avoid mutating the cache directly
    return {
      ...oldData,
      tourGroups: updatedGroups
    };
  });
  
  console.log("Applied optimistic update to tour data", { tourId, groupCount: updatedGroups.length });
};

/**
 * Updates UI after guide assignment
 */
export const handleUIUpdates = async (
  tourId: string, 
  queryClient: QueryClient, 
  guideId: string | null, 
  guideName: string, 
  success: boolean
): Promise<void> => {
  if (success) {
    console.log(`Guide assignment successful: ${guideName || 'None'}`);
    
    // Force a refresh of tour data
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    
    // Also invalidate related queries to ensure UI consistency
    queryClient.invalidateQueries({ queryKey: ['tours'] });
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  } else {
    console.error("Guide assignment failed");
  }
};
