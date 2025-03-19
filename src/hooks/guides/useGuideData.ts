
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
          return []; // Return empty array on error
        }
        
        return data ? data.map(guide => ({
          id: guide.id,
          name: guide.name,
          birthday: guide.birthday ? new Date(guide.birthday) : new Date(),
          guideType: guide.guide_type as GuideType
        })) : [];
      } catch (error) {
        console.error("Error in useGuideData:", error);
        return [];
      }
    },
    // Add retry and stale time settings
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Use useMemo to prevent unnecessary re-renders
  const guides = useMemo(() => {
    return data || [];
  }, [data]);
  
  return { guides, isLoading };
}
