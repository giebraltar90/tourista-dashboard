
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface TourStatistics {
  tour_id: string;
  tour_name: string;
  location: string;
  date: string;
  group_count: number;
  total_participants: number;
  total_child_count: number;
  total_adult_count: number;
  guides_assigned: number;
}

/**
 * Hook to use the materialized view for tour statistics
 */
export const useTourStatistics = (tourId: string | undefined) => {
  return useQuery({
    queryKey: ['tourStatistics', tourId],
    queryFn: async () => {
      if (!tourId) return null;
      
      try {
        // Query the materialized view directly
        const { data, error } = await supabase
          .from('tour_statistics')
          .select('*')
          .eq('tour_id', tourId)
          .single();
          
        if (error) {
          logger.error("Error fetching tour statistics:", error);
          return null;
        }
        
        return data as TourStatistics;
      } catch (err) {
        logger.error("Exception fetching tour statistics:", err);
        return null;
      }
    },
    enabled: !!tourId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

/**
 * Invalidate tour statistics cache and trigger refetch
 */
export const refreshTourStatistics = async (tourId: string) => {
  if (!tourId) return false;
  
  try {
    // We can manually refresh the materialized view if needed
    const { error } = await supabase.rpc('refresh_tour_statistics');
    
    if (error) {
      logger.error("Error refreshing tour statistics:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error("Exception refreshing tour statistics:", err);
    return false;
  }
};
