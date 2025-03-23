
import { useQuery } from '@tanstack/react-query';
import { fetchTourData } from './services/tourDataService';
import { toast } from 'sonner';
import { EventEmitter } from '@/utils/eventEmitter';

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
        console.error("DATABASE DEBUG: Empty tour ID passed to fetchTourData");
        return null;
      }
      
      try {
        const result = await fetchTourData(tourId);
        
        // Log the result after fetching
        if (result) {
          console.log("DATABASE DEBUG: Tour data fetched successfully with groups:", {
            tourId: result.id,
            tourName: result.tourName || 'Unknown Tour',
            groupCount: result.tourGroups?.length || 0,
            groupData: result.tourGroups?.map(g => ({
              id: g.id,
              name: g.name,
              participantsCount: g.participants?.length || 0
            }))
          });
          
          // Emit an event to notify that tour data was successfully loaded
          EventEmitter.emit(`tour-data-loaded:${tourId}`, { success: true, tourId });
          
          return result;
        } else {
          console.log("DATABASE DEBUG: No tour data returned from fetchTourData");
          
          // Emit an event to notify that tour data failed to load
          EventEmitter.emit(`tour-data-loaded:${tourId}`, { 
            success: false, 
            tourId,
            error: "Tour not found"
          });
          
          toast.error(`Tour not found: ${tourId}`);
          return null;
        }
      } catch (error) {
        console.error("DATABASE DEBUG: Error in fetchTourData:", error);
        
        // Emit an event to notify that tour data failed to load
        EventEmitter.emit(`tour-data-loaded:${tourId}`, { 
          success: false, 
          tourId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        
        // Rethrow to let React Query handle it
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
        toast.error(`Failed to load tour: ${error.message}`);
      }
    }
  });
};
