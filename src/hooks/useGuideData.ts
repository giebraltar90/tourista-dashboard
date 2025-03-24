
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGuideTours } from "./guides/useGuideTours";

export interface GuideInfo {
  name: string;
  birthday?: Date;
  guideType?: string;
}

/**
 * Hook to fetch guide information
 */
export const useGuideInfo = (guideName: string) => {
  return useQuery({
    queryKey: ["guideInfo", guideName],
    queryFn: async (): Promise<GuideInfo | null> => {
      if (!guideName) return null;
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('name', guideName)
        .maybeSingle();
        
      if (error || !data) return null;
      
      return {
        name: data.name,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
        guideType: data.guide_type
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to get guide data including guides list
 */
export const useGuideData = () => {
  const guidesToursResult = useGuideTours();
  
  const guidesQuery = useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*');
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  return {
    ...guidesToursResult,
    guides: guidesQuery.data || [],
    isLoadingGuides: guidesQuery.isLoading,
    guideName: guidesToursResult.guideName
  };
};
