
import { QueryClient } from "@tanstack/react-query";

/**
 * Performs a deep clone to avoid reference issues during optimistic updates
 */
export const deepClone = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

/**
 * Core function to update the query cache with new data
 */
export const updateQueryCache = (
  queryClient: QueryClient,
  queryKey: string[],
  updateFn: (oldData: any) => any
): void => {
  queryClient.setQueryData(queryKey, (oldData: any) => {
    if (!oldData) return null;
    
    // Create a deep copy to avoid reference issues
    const newData = deepClone(oldData);
    
    // Apply the update function to transform the data
    return updateFn(newData);
  });
};
