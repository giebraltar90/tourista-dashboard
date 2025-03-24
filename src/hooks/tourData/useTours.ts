
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchToursFromSupabase } from "@/services/api/tour/fetchSupabaseTours";
import { toast } from "sonner";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        console.log("Fetching tours data");
        return await fetchToursFromSupabase();
      } catch (error) {
        console.error("Error in useTours hook:", error);
        toast.error("Failed to load tours. Please try again.");
        return [];
      }
    },
    // Pass through any options provided and add some defaults
    ...options,
    staleTime: 60000, // 1 minute
    retry: 2
  });
};
