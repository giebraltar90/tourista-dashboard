
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTours, fetchTourById, updateTourGroups } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/TourCard";
import { VentrataTourGroup } from "@/types/ventrata";
import { mockTours } from "@/data/mockData";
import { toast } from "sonner";

// Hook for fetching all tours
export const useTours = (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}) => {
  return useQuery({
    queryKey: ['tours', params],
    queryFn: () => fetchTours(params),
    initialData: mockTours, // Use mock data as initial data until API responds
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      toast.error("Failed to update tour groups. Please try again.");
    },
  });
};
