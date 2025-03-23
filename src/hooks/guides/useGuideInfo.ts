
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { fetchGuideById } from "@/services/api/guideApi";

export function useGuideInfo(guideName: string) {
  const { data, isError, error } = useQuery({
    queryKey: ['guide-info', guideName],
    queryFn: async (): Promise<GuideInfo | null> => {
      if (!guideName) return null;
      
      // Handle potential UUIDs
      if (isValidUuid(guideName)) {
        try {
          // First, try to get the guide directly from the database
          const { data, error } = await supabase
            .from('guides')
            .select('*')
            .eq('id', guideName)
            .single();
            
          if (!error && data) {
            return {
              id: data.id,
              name: data.name,
              birthday: data.birthday ? new Date(data.birthday) : new Date(),
              guideType: data.guide_type
            };
          }
          
          // If not found in database, try the API
          return await fetchGuideById(guideName);
        } catch (error) {
          console.error(`Error fetching guide info for ID ${guideName}:`, error);
          return null;
        }
      }
      
      // Handle guide name lookups
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('name', guideName)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') {
            console.error(`Error fetching guide info for ${guideName}:`, error);
          }
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
    retry: 1, // Only retry once to prevent excessive requests
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });
  
  if (isError) {
    console.error(`Error in useGuideInfo for ${guideName}:`, error);
  }
  
  return data;
}
