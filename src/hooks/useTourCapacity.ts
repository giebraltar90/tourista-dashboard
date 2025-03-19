
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTour } from "@/types/ventrata";
import { updateTourCapacity as updateTourCapacityApi } from "@/services/ventrataApi";
import { toast } from "sonner";

export const useUpdateTourCapacity = (tourId: string) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (updatedTour: VentrataTour) => {
      return updateTourCapacityApi(tourId, updatedTour);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      const isHighSeason = variables.isHighSeason;
      toast.success(`Tour capacity updated to ${isHighSeason ? 'high season' : 'standard'} mode`);
    },
    onError: (error) => {
      console.error("Error updating tour capacity:", error);
      toast.error("Failed to update tour capacity");
    }
  });
  
  return {
    updateTourCapacity: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
};
