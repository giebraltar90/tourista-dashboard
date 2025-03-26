
import { useQuery } from '@tanstack/react-query';
import { GuideInfo } from '@/types/ventrata';
import { supabase } from '@/integrations/supabase/client';
import { logger } from "@/utils/logger";

/**
 * Fetch guide information by ID
 */
const fetchGuideInfo = async (guideId: string): Promise<GuideInfo | null> => {
  if (!guideId) return null;
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, name, guide_type')
      .eq('id', guideId)
      .single();
      
    if (error || !data) {
      logger.error('Error fetching guide info:', error);
      return null;
    }
    
    // Map from database format to application format
    return {
      id: data.id,
      name: data.name,
      guideType: data.guide_type
    };
  } catch (error) {
    logger.error('Error in fetchGuideInfo:', error);
    return null;
  }
};

/**
 * Hook to get guide information by ID
 */
export const useGuideInfo = (guideId: string) => {
  return useQuery({
    queryKey: ['guide', guideId],
    queryFn: () => fetchGuideInfo(guideId),
    enabled: !!guideId,
    staleTime: 60000, // 1 minute
  });
};
