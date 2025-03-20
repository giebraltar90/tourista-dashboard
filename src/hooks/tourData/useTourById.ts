
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';

/**
 * Custom hook to fetch tour data by ID with improved caching
 */
export const useTourById = (tourId: string) => {
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => fetchTourData(tourId),
    enabled: !!tourId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch automatically on window focus
    refetchOnMount: true,
    retry: 2,
    // Properly type the error handling
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching tour data:', error);
      }
    }
  });
};
