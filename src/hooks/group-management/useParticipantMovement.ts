
import { useCallback, useState } from "react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { updateParticipantGroupInDatabase } from "./services/participantService";
import { useUpdateTourGroups } from "@/hooks/tourData/useUpdateTourGroups";
import { useQueryClient } from "@tanstack/react-query";

export const useParticipantMovement = (
  tourId: string, 
  tourGroups: VentrataTourGroup[]
) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  const [isMovePending, setIsMovePending] = useState(false);
  const { mutate: updateTourGroups } = useUpdateTourGroups(tourId);
  const queryClient = useQueryClient();

  // Handle moving a participant to another group
  const handleMoveParticipant = useCallback(async (toGroupIndex: number) => {
    if (!selectedParticipant || !tourGroups || toGroupIndex < 0 || toGroupIndex >= tourGroups.length) {
      console.error("Invalid move attempt - missing data or invalid group index");
      return;
    }
    
    setIsMovePending(true);
    
    try {
      // Extract needed data
      const { participant, fromGroupIndex } = selectedParticipant;
      const fromGroup = tourGroups[fromGroupIndex];
      const toGroup = tourGroups[toGroupIndex];
      
      // Skip if trying to move to the same group
      if (fromGroupIndex === toGroupIndex) {
        toast.info("Participant is already in this group");
        setSelectedParticipant(null);
        setIsMovePending(false);
        return;
      }
      
      console.log(`Moving participant ${participant.id} from group ${fromGroup.id} to group ${toGroup.id}`);
      
      // Clone the tourGroups to avoid state mutation
      const updatedGroups = JSON.parse(JSON.stringify(tourGroups));
      
      // Get participant count values, defaulting to 1 if not specified
      const participantCount = participant.count || 1;
      const childCount = participant.childCount || 0;
      
      // 1. Update database first
      const dbUpdateSuccess = await updateParticipantGroupInDatabase(participant.id, toGroup.id);
      
      if (!dbUpdateSuccess) {
        toast.error("Failed to update participant's group in the database");
        setIsMovePending(false);
        return;
      }
      
      // 2. Update local state with modified groups
      // First remove from the source group
      if (Array.isArray(updatedGroups[fromGroupIndex].participants)) {
        updatedGroups[fromGroupIndex].participants = 
          updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
          
        // Update counts for fromGroup
        updatedGroups[fromGroupIndex].size = Math.max(0, (updatedGroups[fromGroupIndex].size || 0) - participantCount);
        updatedGroups[fromGroupIndex].childCount = Math.max(0, (updatedGroups[fromGroupIndex].childCount || 0) - childCount);
      }
      
      // Then add to the destination group
      if (!Array.isArray(updatedGroups[toGroupIndex].participants)) {
        updatedGroups[toGroupIndex].participants = [];
      }
      
      // Update the participant's group_id to the new group
      const updatedParticipant = {...participant, group_id: toGroup.id};
      updatedGroups[toGroupIndex].participants.push(updatedParticipant);
      
      // Update counts for toGroup
      updatedGroups[toGroupIndex].size = (updatedGroups[toGroupIndex].size || 0) + participantCount;
      updatedGroups[toGroupIndex].childCount = (updatedGroups[toGroupIndex].childCount || 0) + childCount;
      
      // 3. Call updateTourGroups to persist changes
      updateTourGroups(updatedGroups, {
        onSuccess: () => {
          toast.success(`Moved ${participant.name} to ${toGroup.name || `Group ${toGroupIndex + 1}`}`);
          
          // Force a refresh of the tour data to reflect these changes in other components
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
            // Also invalidate the tours list to update the overview
            queryClient.invalidateQueries({ queryKey: ['tours'] });
          }, 500);
        },
        onError: (error: any) => {
          console.error("Error updating tour groups:", error);
          toast.error("Failed to save group changes");
        }
      });
      
      // Reset selection regardless
      setSelectedParticipant(null);
    } catch (error) {
      console.error("Error moving participant:", error);
      toast.error("Failed to move participant");
    } finally {
      setIsMovePending(false);
    }
  }, [selectedParticipant, tourGroups, tourId, updateTourGroups, queryClient]);

  // Function to open the move dialog 
  const handleOpenMoveDialog = useCallback((data: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  }) => {
    setSelectedParticipant(data);
  }, []);

  // Function to close the move dialog
  const handleCloseMoveDialog = useCallback(() => {
    setSelectedParticipant(null);
  }, []);

  return {
    selectedParticipant,
    isMovePending,
    handleMoveParticipant,
    handleOpenMoveDialog,
    handleCloseMoveDialog,
  };
};
