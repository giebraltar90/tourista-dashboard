
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

/**
 * Hook to update tour groups with improved state persistence
 */
export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedGroups: VentrataTourGroup[]) => {
      logger.debug("Updating tour groups for:", tourId, {
        groupCount: updatedGroups.length,
        groups: updatedGroups.map(g => ({
          id: g.id,
          name: g.name,
          guideId: g.guideId,
          participantsCount: g.participants?.length || 0
        }))
      });
      
      try {
        // Make a deep copy of the updated groups to avoid reference issues
        const groupsToUpdate = JSON.parse(JSON.stringify(updatedGroups));
        
        // Ensure each group has valid properties before updating
        groupsToUpdate.forEach((group: VentrataTourGroup) => {
          // Make sure participants array exists
          if (!Array.isArray(group.participants)) {
            group.participants = [];
          }
          
          // Ensure the guideId is also set as guide_id for database compatibility
          if (group.guideId) {
            group.guide_id = group.guideId;
          } else if (group.guide_id) {
            group.guideId = group.guide_id;
          }
          
          // Calculate size and childCount directly from participants
          let size = 0;
          let childCount = 0;
          
          group.participants.forEach(p => {
            size += p.count || 1;
            childCount += p.childCount || 0;
          });
          
          // Update size and childCount based on actual participants
          group.size = size;
          group.childCount = childCount;
        });
        
        return await updateTourGroups(tourId, groupsToUpdate);
      } catch (error) {
        logger.error("Error updating tour groups:", error);
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
        
        // IMPORTANT: Preserve all participant references during this update
        const updatedGroupsWithParticipants = updatedGroups.map((updatedGroup: VentrataTourGroup) => {
          // Find matching group in old data to preserve its participants
          const oldGroup = newData.tourGroups?.find((g: any) => g.id === updatedGroup.id);
          const participants = Array.isArray(updatedGroup.participants) && updatedGroup.participants.length > 0
            ? updatedGroup.participants  // Use the updated participants if they exist
            : (Array.isArray(oldGroup?.participants) ? oldGroup.participants : []); // Fall back to old participants
            
          // Create a safe copy
          return {
            ...updatedGroup,
            participants: JSON.parse(JSON.stringify(participants)),
            // Ensure guide_id and guideId are both set for compatibility
            guide_id: updatedGroup.guideId || updatedGroup.guide_id,
            guideId: updatedGroup.guideId || updatedGroup.guide_id
          };
        });
        
        newData.tourGroups = updatedGroupsWithParticipants;
        
        logger.debug("Optimistic update applied to tour data", {
          tourId,
          groupCount: newData.tourGroups.length,
          withParticipants: newData.tourGroups.map((g: any) => ({
            id: g.id,
            name: g.name,
            guideId: g.guideId,
            guide_id: g.guide_id,
            participantsCount: g.participants?.length || 0
          }))
        });
        
        return newData;
      });
      
      return { previousTour };
    },
    onSuccess: () => {
      logger.debug("Successfully updated tour groups - keeping optimistic update");
      toast.success("Changes saved successfully");
      
      // Invalidate the query after a delay to ensure our optimistic update gets rendered first
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 1000);
    },
    onError: (error, _, context) => {
      logger.error("Error updating tour groups:", error);
      toast.error("Failed to update tour groups on the server.");
      
      // Revert to previous state on error
      if (context?.previousTour) {
        queryClient.setQueryData(['tour', tourId], context.previousTour);
      }
    },
  });
};
