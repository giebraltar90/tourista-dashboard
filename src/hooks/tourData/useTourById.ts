
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { useEffect } from 'react';

/**
 * Custom hook to fetch tour data by ID with improved caching and error handling
 */
export const useTourById = (tourId: string) => {
  logger.debug("DATABASE DEBUG: useTourById hook called with ID:", tourId);
  
  const query = useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      logger.debug("DATABASE DEBUG: Executing fetchTourData for:", tourId);
      
      if (!tourId) {
        logger.error("DATABASE DEBUG: Empty tour ID provided to useTourById");
        throw new Error("Invalid tour ID");
      }
      
      try {
        const result = await fetchTourData(tourId);
        
        // Log the result after fetching
        if (result) {
          logger.debug("DATABASE DEBUG: Tour data fetched successfully with groups:", {
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
          logger.error("DATABASE DEBUG: No tour data returned from fetchTourData");
          toast.error("Tour data not found");
          throw new Error("Tour not found. Please check the tour ID and try again.");
        }
        
        return result;
      } catch (error) {
        logger.error("DATABASE DEBUG: Error in useTourById:", error);
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
        logger.error('DATABASE DEBUG: Error fetching tour data:', error);
        toast.error("Failed to load tour data. Please try again.");
      }
    }
  });

  // Add an effect to log when there's an error
  useEffect(() => {
    if (query.error) {
      logger.error(`Error fetching tour ${tourId}:`, query.error);
    }
  }, [query.error, tourId]);

  return query;
};
