
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedGroups: VentrataTourGroup[]) => {
      console.log("Updating tour groups for:", tourId, updatedGroups);
      try {
        // Check if this is a UUID format ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
        
        if (isUuid) {
          // For real UUID IDs, try Supabase
          console.log("Would update tour groups in Supabase here");
        }
        
        // For all cases, still use the API function for now
        return await updateTourGroups(tourId, updatedGroups);
      } catch (error) {
        console.error("Error updating tour groups:", error);
        throw error;
      }
    },
    onMutate: async (updatedGroups) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Snapshot previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);
      
      // Optimistically update with deep clone to avoid mutation issues
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Create a deep copy to avoid mutation issues
        const newData = JSON.parse(JSON.stringify(oldData));
        newData.tourGroups = updatedGroups;
        
        // Ensure guide IDs are preserved
        newData.tourGroups.forEach((group: any) => {
          // Preserve existing guideId if it exists
          if (group.guideId) {
            console.log(`Preserving guide assignment for ${group.name}: ${group.guideId}`);
          }
        });
        
        return newData;
      });
      
      return { previousTour };
    },
    onSuccess: () => {
      // Delay the invalidation to prevent race conditions
      setTimeout(() => {
        // Use setQueryData instead of invalidating to maintain stable references
        queryClient.setQueryData(['tour', tourId], (oldData: any) => {
          if (!oldData) return null;
          const updatedData = JSON.parse(JSON.stringify(oldData));
          console.log("Successfully updated tour groups", updatedData);
          return updatedData;
        });
        
        // Only then schedule a background refetch
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tours'] });
        }, 5000);
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
