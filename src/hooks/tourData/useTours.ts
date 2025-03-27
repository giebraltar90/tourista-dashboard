
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchToursFromSupabase } from "@/services/api/tour/fetchSupabaseTours";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { mockTours } from "@/data/mockData";

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
        
        // If we know authentication has already failed, return mock data immediately
        if (isAuthenticated === false) {
          logger.warn("⚠️ Using mock tour data because authentication failed");
          toast.info("Using demo data due to connection issues");
          return mockTours;
        }
        
        const toursData = await fetchToursFromSupabase()
          .catch(err => {
            logger.error("❌ Error fetching tours from Supabase:", err);
            toast.error("Connection issue. Using demo data instead.");
            return mockTours;
          });
        
        // Log response for debugging
        logger.debug(`✅ Successfully fetched ${toursData.length} tours`);
        
        if (toursData.length === 0) {
          logger.warn("⚠️ No tours returned from Supabase, using mock data instead");
          return mockTours;
        }
        
        return toursData;
      } catch (error) {
        logger.error("❌ Error in useTours hook:", error);
        toast.error("Failed to load tours. Using demo data instead.");
        return mockTours; // Return mock data instead of throwing to prevent UI from breaking
      }
    },
    // Pass through any options provided and add some defaults
    ...options,
    enabled: (options.enabled !== false), // Always enable by default
    staleTime: 30000, // 30 seconds
    retry: 2, // Reduce retries to avoid excessive API calls
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 300000, // Refetch every 5 minutes instead of every minute to reduce API load
  });
};
