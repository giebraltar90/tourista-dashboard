
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Hook to get guide names from their IDs
 */
export const useGuideNames = (guideIds: string[]) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['guideNames', guideIds],
    queryFn: async () => {
      if (!guideIds || guideIds.length === 0) return {};
        
      // Filter out empty IDs
      const validIds = guideIds.filter(id => id && id !== "_none");
      
      if (validIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('guides')
        .select('id, name, guide_type')
        .in('id', validIds);
        
      if (error) {
        logger.error("Error fetching guide names:", error);
        return {};
      }
      
      // Create a map of guide IDs to their data
      return data.reduce((map, guide) => {
        map[guide.id] = {
          name: guide.name,
          guide_type: guide.guide_type
        };
        return map;
      }, {} as Record<string, { name: string; guide_type: string }>);
    },
    enabled: guideIds && guideIds.length > 0,
    staleTime: 60000, // 1 minute
  });
  
  return {
    guideNamesMap: data || {},
    isLoading,
    error
  };
};

/**
 * Get guide name in a safe way with fallback
 */
export const getGuideName = (
  guideId: string | undefined | null, 
  guidesMap: Record<string, { name: string; guide_type: string }> = {}
): string => {
  if (!guideId) return "Unassigned";
  if (guideId === "_none") return "Unassigned";
  
  // Check if we have this guide in our map
  if (guidesMap[guideId]) {
    return guidesMap[guideId].name;
  }
  
  // If it's a UUID but we don't have data, show a truncated version
  if (guideId.includes('-')) {
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  // Just use the ID as a last resort
  return guideId;
};
