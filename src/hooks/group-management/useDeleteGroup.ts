
import { useState } from "react";
import { useTourById } from "../useTourData";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";

interface UseDeleteGroupOptions {
  /**
   * If true, will attempt to distribute participants to other groups.
   * If false, participants will be removed along with the group.
   */
  redistributeParticipants?: boolean;
}

export const useDeleteGroup = (tourId: string, options: UseDeleteGroupOptions = {}) => {
  const { data: tour, refetch } = useTourById(tourId);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const redistributeParticipants = options.redistributeParticipants ?? true;
  
  /**
   * Deletes a group and optionally redistributes its participants to other groups
   * @param groupIndex The index of the group to delete
   * @returns Promise that resolves when the operation is complete
   */
  const deleteGroup = async (groupIndex: number): Promise<boolean> => {
    try {
      setIsDeleting(true);
      
      if (!tour) {
        throw new Error("Tour not found");
      }
      
      // Check if this is the only group - don't allow deletion
      if (tour.tourGroups.length <= 1) {
        toast.error("Cannot delete the only group. Create another group first.");
        return false;
      }
      
      const groupToDelete = tour.tourGroups[groupIndex];
      const updatedGroups = [...tour.tourGroups];
      
      // Handle participants redistribution if needed
      if (redistributeParticipants && groupToDelete.participants && groupToDelete.participants.length > 0) {
        const remainingGroups = updatedGroups.filter((_, index) => index !== groupIndex);
        const participantsToRedistribute = [...groupToDelete.participants];
        
        // Distribute participants across remaining groups
        redistributeParticipantsToGroups(participantsToRedistribute, remainingGroups);
      }
      
      // Remove the group
      updatedGroups.splice(groupIndex, 1);
      
      // Update tour groups on the server
      await updateTourGroups(tourId, updatedGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      toast.success(`Group "${groupToDelete.name}" deleted successfully`);
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  /**
   * Redistributes a list of participants across multiple groups
   * trying to keep the groups balanced
   */
  const redistributeParticipantsToGroups = (
    participants: VentrataParticipant[], 
    groups: VentrataTourGroup[]
  ) => {
    if (!participants.length || !groups.length) return;
    
    // Sort participants by count (largest first) for better distribution
    participants.sort((a, b) => b.count - a.count);
    
    // For each participant, find the group with the smallest size
    participants.forEach(participant => {
      // Sort groups by current size (smallest first)
      const sortedGroups = [...groups].sort((a, b) => a.size - b.size);
      const targetGroup = sortedGroups[0];
      
      // Add participant to the smallest group
      if (!targetGroup.participants) {
        targetGroup.participants = [];
      }
      
      targetGroup.participants.push(participant);
      targetGroup.size += participant.count;
      
      // Update child count if needed
      if (participant.childCount && participant.childCount > 0) {
        targetGroup.childCount = (targetGroup.childCount || 0) + participant.childCount;
      }
    });
  };
  
  return {
    deleteGroup,
    isDeleting
  };
};
