import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataToursResponse, VentrataTourGroup } from "@/types/ventrata";
import { fetchTours, fetchTourById, updateTourGroups } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/TourCard";
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
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => fetchTourById(tourId),
    initialData: () => mockTours.find(tour => tour.id === tourId) || null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for updating tour groups
export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedGroups: VentrataTourGroup[]) => 
      updateTourGroups(tourId, updatedGroups),
    onSuccess: () => {
      // Invalidate and refetch tour data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success("Tour groups updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tour groups:", error);
      toast.error("Failed to update tour groups on the server. Local changes preserved.");
      
      // Don't invalidate queries on error, let the UI keep its state
      return Promise.resolve();
    },
  });
};

// Function to convert API response to our app's data structure
const transformTours = (response: VentrataToursResponse): TourCardProps[] => {
  return response.data.map(tour => ({
    id: tour.id,
    date: new Date(tour.date),
    location: tour.location,
    tourName: tour.tourName,
    tourType: tour.tourType,
    startTime: tour.startTime,
    referenceCode: tour.referenceCode,
    guide1: tour.guide1,
    guide2: tour.guide2,
    tourGroups: tour.tourGroups,
    numTickets: tour.numTickets
  }));
};
