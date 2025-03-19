
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTour } from "@/types/ventrata";
import { updateTourCapacity as updateTourCapacityApi } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useModifications } from "./useModifications";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateTourCapacity = (tourId: string) => {
  const queryClient = useQueryClient();
  const { addModification } = useModifications(tourId);
  
  const mutation = useMutation({
    mutationFn: async (updatedTour: VentrataTour) => {
      console.log("Updating tour capacity for tour", tourId, updatedTour);
      console.log("New high season value:", updatedTour.isHighSeason);
      
      try {
        // For demo tours with string IDs like "tour-1", skip Supabase and use the API
        if (tourId.startsWith('tour-')) {
          console.log("Using mock API for tour-* ID");
          return updateTourCapacityApi(tourId, updatedTour);
        }
        
        // Only attempt Supabase update for valid UUIDs
        const { error } = await supabase
          .from('tours')
          .update({ is_high_season: updatedTour.isHighSeason })
          .eq('id', tourId);
          
        if (error) {
          console.warn("Supabase update failed, falling back to API", error);
          // Fall back to API call if Supabase fails
          return updateTourCapacityApi(tourId, updatedTour);
        }
        
        return true;
      } catch (err) {
        console.warn("Database error, falling back to API", err);
        // Fall back to API call
        return updateTourCapacityApi(tourId, updatedTour);
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });

      // Snapshot the previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);

      // Optimistically update the cache with the new value
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return oldData;
        console.log("Optimistically updating tour data:", {
          ...oldData,
          isHighSeason: variables.isHighSeason
        });
        return {
          ...oldData,
          isHighSeason: variables.isHighSeason
        };
      });

      // Return the snapshot so we can rollback in case of failure
      return { previousTour };
    },
    onSuccess: (_, variables) => {
      // Ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      const isHighSeason = Boolean(variables.isHighSeason);
      const modeText = isHighSeason ? 'high season' : 'standard';
      
      // Add a modification record
      addModification(`Tour capacity mode changed to ${modeText}`, {
        type: "capacity_update",
        oldMode: !isHighSeason ? 'high season' : 'standard',
        newMode: modeText
      });
      
      toast.success(`Tour capacity updated to ${modeText} mode`);
    },
    onError: (error, _, context) => {
      console.error("Error updating tour capacity:", error);
      toast.error("Failed to update tour capacity");
      
      // Roll back to the previous value
      if (context?.previousTour) {
        queryClient.setQueryData(['tour', tourId], context.previousTour);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure our local data is in sync with server
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 500); // Small delay to allow other operations to complete
    }
  });
  
  return {
    updateTourCapacity: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
};
