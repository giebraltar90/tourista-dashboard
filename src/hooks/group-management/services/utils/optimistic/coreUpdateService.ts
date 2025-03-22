
import { QueryClient } from "@tanstack/react-query";

/**
 * Updates a query cache key with the result of a transform function
 */
export const updateQueryCache = (
  queryClient: QueryClient,
  queryKey: unknown[],
  transform: (oldData: any) => any
): void => {
  queryClient.setQueryData(queryKey, (oldData: any) => {
    if (!oldData) return null;
    return transform(oldData);
  });
};
