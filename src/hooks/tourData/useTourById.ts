
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';
import { toast } from 'sonner';

/**
 * Custom hook to fetch tour data by ID with improved caching and error handling
 */
export const useTourById = (tourId: string) => {
  console.log("DATABASE DEBUG: useTourById hook called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("DATABASE DEBUG: Executing fetchTourData for:", tourId);
      
      if (!tourId) {
        console.error("DATABASE DEBUG: Empty tour ID provided to useTourById");
        toast.error("Invalid tour ID");
        throw new Error("Invalid tour ID");
      }
      
      try {
        const result = await fetchTourData(tourId);
        
        // Log the result after fetching
        if (result) {
          console.log("DATABASE DEBUG: Tour data fetched successfully with groups:", {
            tourId: result.id,
            tourName: result.tourName,
            groupCount: result.tourGroups?.length || 0,
            groupData: result.tourGroups?.map(g => ({
              id: g.id,
              name: g.name,
              participantsCount: g.participants?.length || 0
            }))
          });
        } else {
          console.log("DATABASE DEBUG: No tour data returned from fetchTourData");
          toast.error("Tour data not found");
        }
        
        return result;
      } catch (error) {
        console.error("DATABASE DEBUG: Error in useTourById:", error);
        toast.error("Failed to load tour data. Please try again.");
        throw error;
      }
    },
    enabled: !!tourId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch automatically on window focus
    refetchOnMount: true,
    retry: 3, // Increase retry attempts
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Properly type the error handling
    meta: {
      onError: (error: Error) => {
        console.error('DATABASE DEBUG: Error fetching tour data:', error);
      }
    }
  });
};
