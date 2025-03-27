
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useQuery } from "@tanstack/react-query";
import { GuideInfo } from "@/types/ventrata";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch guide information by ID
 */
export const useGuideInfo = (guideId: string) => {
  const query = useQuery({
    queryKey: ['guide', guideId],
    queryFn: async () => {
      if (!guideId) return null;
      
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('id', guideId)
        .single();
        
      if (error) throw error;
      return data as GuideInfo;
    },
    enabled: !!guideId,
  });
  
  return query;
};

/**
 * Hook to extract guide information from a tour
 */
export const useGuideInfo2 = (tour?: TourCardProps | null) => {
  const { data: guides = [], isLoading } = useQuery<GuideInfo[]>({
    queryKey: ['guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*');
      
      if (error) throw error;
      return data as GuideInfo[];
    }
  });
  
  return useMemo(() => {
    if (!tour || !guides || guides.length === 0) {
      return { guide1Info: null, guide2Info: null, guide3Info: null, isLoading };
    }

    // Find the guide objects that match the IDs in the tour
    const guide1Info = tour.guide1 
      ? guides.find(guide => guide.id === tour.guide1) as GuideInfo || null
      : null;
      
    const guide2Info = tour.guide2 
      ? guides.find(guide => guide.id === tour.guide2) as GuideInfo || null
      : null;
      
    const guide3Info = tour.guide3 
      ? guides.find(guide => guide.id === tour.guide3) as GuideInfo || null
      : null;

    return { guide1Info, guide2Info, guide3Info, isLoading };
  }, [tour, guides, isLoading]);
};
