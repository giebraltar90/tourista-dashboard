
import { useTourById } from "../useTourData";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UseDeleteGroupOptions {
  redistributeParticipants?: boolean;
}

export const useDeleteGroup = (tourId: string, options: UseDeleteGroupOptions = {}) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { redistributeParticipants = false } = options;
  const queryClient = useQueryClient();
  
  const deleteGroup = async (groupIndex: number) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      const groupToDelete = updatedTourGroups[groupIndex];
      
      console.log("Deleting group:", { groupIndex, group: groupToDelete });
      
      // If we need to redistribute participants to other groups
      if (redistributeParticipants && groupToDelete.participants?.length > 0) {
        // If there's only one group, we can't delete it with redistribution
        if (updatedTourGroups.length <= 1) {
          toast.error("Cannot delete the only group. Create another group first.");
          return false;
        }
        
        // Get other available groups
        const otherGroups = updatedTourGroups.filter((_, idx) => idx !== groupIndex);
        
        // Redistribute participants to other groups
        let currentGroupIndex = 0;
        groupToDelete.participants.forEach((participant: VentrataParticipant) => {
          // Pick the next group in a round-robin fashion
          const targetGroup = otherGroups[currentGroupIndex];
          
          // Add the participant to the target group
          if (!targetGroup.participants) {
            targetGroup.participants = [];
          }
          
          targetGroup.participants.push(participant);
          targetGroup.size = (targetGroup.size || 0) + participant.count;
          
          // Update child count if applicable
          if (participant.childCount) {
            targetGroup.childCount = (targetGroup.childCount || 0) + participant.childCount;
          }
          
          // Move to the next group for the next participant
          currentGroupIndex = (currentGroupIndex + 1) % otherGroups.length;
        });
      }
      
      // Remove the group
      updatedTourGroups.splice(groupIndex, 1);
      
      const result = await updateTourGroups(tourId, updatedTourGroups);
      console.log("Delete group API response:", result);
      
      // Forcefully invalidate queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      // Refetch tour data to update UI
      await refetch();
      
      toast.success("Group deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
      return false;
    }
  };
  
  return { deleteGroup, isDeleting: false };
};
