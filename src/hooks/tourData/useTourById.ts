
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';

/**
 * Custom hook to fetch tour data by ID with improved caching
 */
export const useTourById = (tourId: string) => {
  console.log("DATABASE DEBUG: useTourById hook called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("DATABASE DEBUG: Executing fetchTourData for:", tourId);
      const result = await fetchTourData(tourId);
      
      // Log the result after fetching
      if (result) {
        console.log("DATABASE DEBUG: Tour data fetched successfully with groups:", {
          tourId: result.id,
          groupCount: result.tourGroups?.length || 0,
          groupData: result.tourGroups?.map(g => ({
            id: g.id,
            name: g.name,
            participantsCount: g.participants?.length || 0
          }))
        });
      } else {
        console.log("DATABASE DEBUG: No tour data returned from fetchTourData");
      }
      
      return result;
    },
    enabled: !!tourId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch automatically on window focus
    refetchOnMount: true,
    retry: 2,
    // Properly type the error handling
    meta: {
      onError: (error: Error) => {
        console.error('DATABASE DEBUG: Error fetching tour data:', error);
      }
    }
  });
};
