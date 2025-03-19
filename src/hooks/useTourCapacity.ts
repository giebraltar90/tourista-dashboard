
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
      
      // Use a more reliable UUID validation pattern
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
      
      // Track success for each attempt
      let storageSuccess = false;
      
      // Convert to boolean explicitly to ensure correct type
      const highSeasonValue = Boolean(updatedTour.isHighSeason);
      
      try {
        if (isUuid) {
          console.log("Attempting Supabase update for tour:", tourId);
          console.log("Sending to Supabase:", { is_high_season: highSeasonValue });
          
          const { data, error } = await supabase
            .from('tours')
            .update({ is_high_season: highSeasonValue })
            .eq('id', tourId)
            .select();
            
          if (error) {
            console.error("Supabase update failed:", error.message);
          } else {
            console.log("Supabase update successful:", data);
            storageSuccess = true;
          }
        }
      } catch (err) {
        console.error("Database error:", err);
      }
      
      // If Supabase failed or it's a non-UUID tour, try the API
      if (!storageSuccess) {
        console.log("Using API fallback for capacity update");
        try {
          const apiSuccess = await updateTourCapacityApi(tourId, updatedTour);
          if (apiSuccess) {
            storageSuccess = true;
          }
        } catch (err) {
          console.error("API update failed:", err);
          // Let the error bubble up if both methods failed
          if (!storageSuccess) {
            throw new Error("Failed to update tour capacity");
          }
        }
      }
      
      return storageSuccess;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });

      // Snapshot the previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);

      // Optimistically update the cache with the new value
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Create a new deep copy to ensure React detects the change
        const newData = JSON.parse(JSON.stringify(oldData));
        
        // Explicitly and clearly set the isHighSeason boolean value
        newData.isHighSeason = Boolean(variables.isHighSeason);
        
        console.log("Optimistically updating tour data:", newData);
        return newData;
      });

      // Return the snapshot so we can rollback in case of failure
      return { previousTour };
    },
    onSuccess: (_, variables) => {
      // Update the cache directly for consistent UI
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Create a fresh copy with the updated value explicitly set
        const updatedData = JSON.parse(JSON.stringify(oldData));
        updatedData.isHighSeason = Boolean(variables.isHighSeason);
        
        console.log("Confirmed tour data update:", updatedData);
        return updatedData;
      });
      
      // Add a modification record AFTER the update is confirmed successful
      const isHighSeason = Boolean(variables.isHighSeason);
      const modeText = isHighSeason ? 'high season' : 'standard';
      
      addModification(`Tour capacity mode changed to ${modeText}`, {
        type: "capacity_update",
        oldMode: !isHighSeason ? 'high season' : 'standard',
        newMode: modeText
      });
      
      toast.success(`Tour capacity updated to ${modeText} mode`);
      
      // Schedule a delayed background refresh to sync with server
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 3000);
    },
    onError: (error, _, context) => {
      console.error("Error updating tour capacity:", error);
      toast.error("Failed to update tour capacity");
      
      // Roll back to the previous value
      if (context?.previousTour) {
        queryClient.setQueryData(['tour', tourId], context.previousTour);
      }
    }
  });
  
  return {
    updateTourCapacity: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
};
