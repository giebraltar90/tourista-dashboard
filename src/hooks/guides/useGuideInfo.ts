
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideInfo } from "@/types/ventrata";

export function useGuideInfo(guideName: string) {
  const { data } = useQuery({
    queryKey: ['guide-info', guideName],
    queryFn: async (): Promise<GuideInfo | null> => {
      if (!guideName) return null;
      
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('name', guideName)
          .single();
        
        if (error) {
          console.error(`Error fetching guide info for ${guideName}:`, error);
          return null;
        }
        
        if (!data) return null;
        
        return {
          id: data.id,
          name: data.name,
          birthday: data.birthday ? new Date(data.birthday) : new Date(),
          guideType: data.guide_type
        };
      } catch (error) {
        console.error(`Error in useGuideInfo for ${guideName}:`, error);
        return null;
      }
    },
    enabled: !!guideName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  return data;
}
