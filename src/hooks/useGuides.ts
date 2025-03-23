
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface GuideData {
  id: string;
  name: string;
  guide_type: "GA Ticket" | "GA Free" | "GC";
  birthday: string;
  updated_at: string;
  created_at: string;
  user_id: string;
}

/**
 * Hook to fetch all available guides
 */
export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: async (): Promise<GuideData[]> => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .order('name');
        
        if (error) {
          logger.error("Error fetching guides:", error);
          throw new Error(error.message);
        }
        
        return data || [];
      } catch (error) {
        logger.error("Unexpected error in useGuides:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
