
import { useQuery } from "@tanstack/react-query";
import { fetchTours } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        // For now, just use mock data
        console.log("Using mock tour data");
        return mockTours;
      } catch (error) {
        console.error("Error fetching tours:", error);
        return mockTours;
      }
    },
    // Pass through any options provided
    ...options,
  });
};
