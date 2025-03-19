
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideType } from "@/types/ventrata";

export function useGuideData() {
  const { data, isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .order('name');
          
        if (error) {
          console.error("Error fetching guides:", error);
          throw error;
        }
        
        return data.map(guide => ({
          id: guide.id,
          name: guide.name,
          birthday: new Date(guide.birthday),
          guideType: guide.guide_type as GuideType
        }));
      } catch (error) {
        console.error("Error in useGuideData:", error);
        return [];
      }
    }
  });
  
  const guides = useMemo(() => {
    return data || [];
  }, [data]);
  
  return { guides, isLoading };
}
