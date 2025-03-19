
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataToursResponse, VentrataTourGroup } from "@/types/ventrata";
import { fetchTours, fetchTourById, updateTourGroups } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { toast } from "sonner";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      // In a real app, we would call the API and transform the response:
      // const response = await fetchTours();
      // return transformTours(response);
      
      // For now, we're using mock data
      return mockTours;
    },
    // Pass through any options provided
    ...options,
  });
};

// Hook for fetching a single tour by ID
export const useTourById = (tourId: string) => {
  console.log("useTourById called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => {
      console.log("Fetching tour data for ID:", tourId);
      // For now, use mock data but in real app would call API
      const tourData = mockTours.find(tour => tour.id === tourId);
      console.log("Found tour data:", tourData);
      
      if (!tourData) return null;
      
      // Create a clean copy of the tour data
      const cleanedTourData = {...tourData};
      
      // CRITICAL FIX: Ensure isHighSeason is properly converted to boolean using strict equality
      cleanedTourData.isHighSeason = tourData.isHighSeason === true;
      
      console.log("Cleaned tour data with isHighSeason:", cleanedTourData.isHighSeason);
      
      return cleanedTourData;
    },
    // CRITICAL FIX: Increase staleTime and cacheTime dramatically to reduce unnecessary refetches
    staleTime: 180 * 1000, // 3 minutes (increased further)
    gcTime: 600 * 1000,   // 10 minutes cache time
    enabled: !!tourId, // Only run the query if tourId is provided
  });
};

// Hook for updating tour groups
export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedGroups: VentrataTourGroup[]) => 
      updateTourGroups(tourId, updatedGroups),
    onMutate: async (updatedGroups) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Snapshot previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);
      
      // Optimistically update
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return {
          ...oldData,
          tourGroups: updatedGroups
        };
      });
      
      return { previousTour };
    },
    onSuccess: () => {
      // Delay the invalidation to prevent race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        queryClient.invalidateQueries({ queryKey: ['tours'] });
      }, 1000);
      
      toast.success("Tour groups updated successfully");
    },
    onError: (error, _, context) => {
      console.error("Error updating tour groups:", error);
      toast.error("Failed to update tour groups on the server.");
      
      // Revert to previous state on error
      if (context?.previousTour) {
        queryClient.setQueryData(['tour', tourId], context.previousTour);
      }
    },
  });
};

// Function to convert API response to our app's data structure
const transformTours = (response: VentrataToursResponse): TourCardProps[] => {
  return response.data.map(tour => ({
    id: tour.id,
    date: new Date(tour.date), // Convert string to Date if coming from API
    location: tour.location,
    tourName: tour.tourName,
    tourType: tour.tourType,
    startTime: tour.startTime,
    referenceCode: tour.referenceCode,
    guide1: tour.guide1,
    guide2: tour.guide2,
    guide3: tour.guide3,
    tourGroups: tour.tourGroups,
    numTickets: tour.numTickets,
    isHighSeason: Boolean(tour.isHighSeason) // Ensure boolean type with explicit conversion
  }));
};
