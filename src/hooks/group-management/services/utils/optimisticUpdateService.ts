
/**
 * Re-export optimistic update utilities from their dedicated service files
 * This file is maintained for backward compatibility
 */

import { performOptimisticUpdate } from './optimistic';
import { QueryClient } from "@tanstack/react-query";

// Legacy function for backward compatibility
export const performLegacyOptimisticUpdate = (
  queryClient: QueryClient, 
  tourId: string, 
  updatedGroups: any[]
): void => {
  queryClient.setQueryData(['tour', tourId], (oldData: any) => {
    if (!oldData) return null;
    
    // Create a new object to avoid mutating the cache directly
    return {
      ...oldData,
      tourGroups: updatedGroups
    };
  });
};

export { performOptimisticUpdate };
