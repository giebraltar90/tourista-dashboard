
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTour } from "@/types/ventrata";
import { updateTourCapacity as updateTourCapacityApi } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useModifications } from "./useModifications";

export const useUpdateTourCapacity = (tourId: string) => {
  const queryClient = useQueryClient();
  const { addModification } = useModifications(tourId);
  
  const mutation = useMutation({
    mutationFn: (updatedTour: VentrataTour) => {
      console.log("Updating tour capacity for tour", tourId, updatedTour);
      return updateTourCapacityApi(tourId, updatedTour);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      const isHighSeason = variables.isHighSeason;
      const modeText = isHighSeason ? 'high season' : 'standard';
      
      // Add a modification record
      addModification(`Tour capacity mode changed to ${modeText}`, {
        type: "capacity_update",
        oldMode: !isHighSeason ? 'high season' : 'standard',
        newMode: modeText
      });
      
      toast.success(`Tour capacity updated to ${modeText} mode`);
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
