
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';

/**
 * Custom hook to fetch tour data by ID with improved error handling
 */
export const useTourById = (tourId: string) => {
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => fetchTourData(tourId),
    enabled: !!tourId,
    staleTime: 5000, // Reduced stale time to just 5 seconds to ensure frequent refreshes
    gcTime: 300000, // Keep unused data in cache for 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
    refetchOnWindowFocus: true, // Refresh when tab gets focus
    refetchOnMount: true, // Always refresh when component mounts
  });
};
