
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";

export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedGroups: VentrataTourGroup[]) => {
      console.log("Updating tour groups for:", tourId, updatedGroups);
      try {
        // Make a deep copy of the updated groups to avoid reference issues
        const groupsToUpdate = JSON.parse(JSON.stringify(updatedGroups));
        
        // Use the simplified API for now
        return await updateTourGroups(tourId, groupsToUpdate);
      } catch (error) {
        console.error("Error updating tour groups:", error);
        throw error;
      }
    },
    onMutate: async (updatedGroups) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      await queryClient.cancelQueries({ queryKey: ['tours'] });
      
      // Snapshot previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);
      
      // Optimistically update with deep clone to avoid mutation issues
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Create a deep copy to avoid mutation issues
        const newData = JSON.parse(JSON.stringify(oldData));
        newData.tourGroups = JSON.parse(JSON.stringify(updatedGroups));
        
        return newData;
      });
      
      return { previousTour };
    },
    onSuccess: () => {
      // CRITICAL: Permanently disable query invalidation
      // This prevents the UI from reverting to previous state
      
      // This silently confirms the update in the background without triggering a refetch
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return oldData; // Keep our optimistic update
      });
      
      // Cancel any pending queries that might still be in flight
      queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      queryClient.cancelQueries({ queryKey: ['tours'] });
      
      // IMPORTANT: Never refresh the data automatically
      // Let the user manually refresh when they want fresh data
      // This prevents any data loss between tab changes
      
      console.log("Successfully updated tour groups - permanently disabled revalidation");
      toast.success("Changes saved successfully");
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
