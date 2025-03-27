
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchToursFromSupabase } from "@/services/api/tour/fetchSupabaseTours";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  const { isAuthenticated } = useSupabaseAuth();
  
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        logger.debug("🔄 Fetching tours data from Supabase");
        const toursData = await fetchToursFromSupabase();
        
        // Log response for debugging
        logger.debug(`✅ Successfully fetched ${toursData.length} tours`);
        
        if (toursData.length === 0) {
          logger.warn("⚠️ No tours returned from Supabase");
        }
        
        return toursData;
      } catch (error) {
        logger.error("❌ Error in useTours hook:", error);
        toast.error("Failed to load tours. Please try again.");
        throw error; // Let React Query handle the retry
      }
    },
    // Pass through any options provided and add some defaults
    ...options,
    enabled: (options.enabled !== false), // Always enable by default
    staleTime: 30000, // 30 seconds
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 60000, // Refetch every minute
  });
};
