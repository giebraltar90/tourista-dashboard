
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
        logger.info("Fetching tours data");
        return await fetchToursFromSupabase();
      } catch (error) {
        logger.error("Error in useTours hook:", error);
        toast.error("Failed to load tours. Please try again.");
        return [];
      }
    },
    // Pass through any options provided and add some defaults
    ...options,
    enabled: (options.enabled !== false) && (isAuthenticated !== false),
    staleTime: 60000, // 1 minute
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
};
