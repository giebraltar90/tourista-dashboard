
import { QueryClient } from "@tanstack/react-query";
import { updateQueryCache } from './coreUpdateService';
import { updateTourGroupsById } from './groupUpdateService';

/**
 * Applies an optimistic update to the UI cache
 */
export const performOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  updatedGroups: any[]
): void => {
  updateQueryCache(
    queryClient, 
    ['tour', tourId], 
    (oldData: any) => updateTourGroupsById(oldData, updatedGroups)
  );
};

// Re-export all functions for use in other services
export * from './coreUpdateService';
export * from './groupUpdateService';
