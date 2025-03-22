
import { QueryClient } from "@tanstack/react-query";
import { updateQueryCache } from './coreUpdateService';
import { updateTourGroupsById } from './groupUpdateService';

/**
 * Performs an optimistic update on the query cache
 * This is a utility wrapper that combines the other functions
 */
export const performOptimisticUpdate = <T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  updater: (oldData: T) => T
): void => {
  queryClient.setQueryData(queryKey, (oldData: T) => {
    if (!oldData) return null;
    return updater(oldData);
  });
};

// Export the utility functions
export { updateQueryCache, updateTourGroupsById };
