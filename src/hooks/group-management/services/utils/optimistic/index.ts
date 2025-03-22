
export { updateQueryCache } from './coreUpdateService';
export { updateTourGroupsById } from './groupUpdateService';

/**
 * Performs an optimistic update on the query cache
 * This is a utility wrapper that combines the other functions
 */
export const performOptimisticUpdate = <T>(
  queryClient: any,
  queryKey: unknown[],
  updater: (oldData: T) => T
): void => {
  queryClient.setQueryData(queryKey, (oldData: T) => {
    if (!oldData) return null;
    return updater(oldData);
  });
};
