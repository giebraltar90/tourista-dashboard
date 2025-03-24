
import { useQuery } from '@tanstack/react-query';
import { getTourStatistics, invalidateTourCache } from '@/integrations/supabase/client';

/**
 * Hook to use the materialized view for tour statistics
 */
export const useTourStatistics = (tourId: string | undefined) => {
  return useQuery({
    queryKey: ['tourStatistics', tourId],
    queryFn: async () => {
      if (!tourId) return null;
      return getTourStatistics(tourId);
    },
    enabled: !!tourId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

/**
 * Invalidate tour statistics cache and trigger refetch
 */
export const refreshTourStatistics = (tourId: string) => {
  if (!tourId) return;
  invalidateTourCache(tourId);
};
