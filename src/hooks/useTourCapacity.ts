
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
        // Determine if this is a demo tour (without a UUID format ID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
        
        if (!isUuid) {
          console.log("Using mock API for non-UUID tour ID");
          return await updateTourCapacityApi(tourId, updatedTour);
        }
        
        // Only attempt Supabase update for valid UUIDs
        console.log("Attempting Supabase update for tour:", tourId);
        const { error } = await supabase
          .from('tours')
          .update({ is_high_season: updatedTour.isHighSeason })
          .eq('id', tourId);
          
        if (error) {
          console.warn("Supabase update failed, falling back to API", error);
          // Fall back to API call if Supabase fails
          return await updateTourCapacityApi(tourId, updatedTour);
        }
        
        console.log("Supabase update successful");
        return true;
      } catch (err) {
        console.warn("Database error, falling back to API", err);
        // Fall back to API call
        return await updateTourCapacityApi(tourId, updatedTour);
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });

      // Snapshot the previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);

      // Optimistically update the cache with the new value - use deep copy
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
      // Rather than invalidating, update the data directly
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Create a fresh copy with the updated value explicitly set
        const updatedData = JSON.parse(JSON.stringify(oldData));
        updatedData.isHighSeason = Boolean(variables.isHighSeason);
        
        console.log("Confirmed tour data update:", updatedData);
        return updatedData;
      });
      
      // Only schedule a delayed background refetch of the tours list
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
      }, 5000);
      
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
      // Only do a background refetch after a longer delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 15000); // Much longer delay to prevent UI flicker
    }
  });
  
  return {
    updateTourCapacity: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
};
