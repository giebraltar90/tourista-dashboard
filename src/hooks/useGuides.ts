
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideInfo } from "@/types/ventrata";

/**
 * Hook to fetch all guides from the database
 */
export const useGuides = () => {
  return useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("name");
        
      if (error) {
        console.error("Error fetching guides:", error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};
