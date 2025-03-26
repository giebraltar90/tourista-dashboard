
import { useQuery } from '@tanstack/react-query';
import { GuideInfo } from '@/types/ventrata';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch guide information by ID
 */
const fetchGuideInfo = async (guideId: string): Promise<GuideInfo | null> => {
  if (!guideId) return null;
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('name, guide_type')
      .eq('id', guideId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching guide info:', error);
      return null;
    }
    
    return {
      name: data.name,
      guideType: data.guide_type
    };
  } catch (error) {
    console.error('Error in fetchGuideInfo:', error);
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
    enabled: !!guideId
  });
};
