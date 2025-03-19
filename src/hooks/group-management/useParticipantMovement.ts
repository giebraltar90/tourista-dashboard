
import { useCallback, useState } from "react";
import { VentrataParticipant } from "@/types/ventrata";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateTourGroups } from "@/hooks/tourData/useUpdateTourGroups";

export const useParticipantMovement = (
  tourId: string, 
  tourGroups: any[]
) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  const [isMovePending, setIsMovePending] = useState(false);
  const { mutate: updateTourGroups } = useUpdateTourGroups(tourId);

  // Update a participant's group_id directly in the database
  const updateParticipantGroup = useCallback(async (
    participantId: string, 
    newGroupId: string
  ): Promise<boolean> => {
    if (!participantId || !newGroupId) {
      console.error("Missing participant ID or group ID for update");
      return false;
    }
    
    console.log(`Updating participant ${participantId} to group ${newGroupId}`);
    
    // Implement retry logic for database updates
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { error } = await supabase
          .from('participants')
          .update({ group_id: newGroupId })
          .eq('id', participantId);
          
        if (error) {
          console.error(`Failed to update participant (attempt ${attempt}):`, error);
          
          if (attempt < maxRetries) {
            const backoffTime = Math.min(500 * Math.pow(2, attempt), 5000);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          }
          return false;
        }
        
        return true;
      } catch (error) {
        console.error(`Error updating participant (attempt ${attempt}):`, error);
        if (attempt === maxRetries) {
          return false;
        }
      }
    }
    
    return false;
  }, []);

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
      
      // 1. Update database
      const dbUpdateSuccess = await updateParticipantGroup(participant.id, toGroup.id);
      
      if (!dbUpdateSuccess) {
        toast.error("Failed to update participant's group in the database");
        setIsMovePending(false);
        return;
      }
      
      // 2. Update local state with modified groups
      // First remove from the source group
      if (updatedGroups[fromGroupIndex].participants) {
        updatedGroups[fromGroupIndex].participants = 
          updatedGroups[fromGroupIndex].participants.filter((p: any) => p.id !== participant.id);
          
        // Update counts for fromGroup
        const participantCount = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        updatedGroups[fromGroupIndex].size = Math.max(0, (updatedGroups[fromGroupIndex].size || 0) - participantCount);
        updatedGroups[fromGroupIndex].childCount = Math.max(0, (updatedGroups[fromGroupIndex].childCount || 0) - childCount);
      }
      
      // Then add to the destination group
      if (!updatedGroups[toGroupIndex].participants) {
        updatedGroups[toGroupIndex].participants = [];
      }
      
      // Update the participant's group_id to the new group
      const updatedParticipant = {...participant, group_id: toGroup.id};
      updatedGroups[toGroupIndex].participants.push(updatedParticipant);
      
      // Update counts for toGroup
      const participantCount = participant.count || 1;
      const childCount = participant.childCount || 0;
      
      updatedGroups[toGroupIndex].size = (updatedGroups[toGroupIndex].size || 0) + participantCount;
      updatedGroups[toGroupIndex].childCount = (updatedGroups[toGroupIndex].childCount || 0) + childCount;
      
      // 3. Call updateTourGroups to persist changes
      updateTourGroups(updatedGroups, {
        onSuccess: () => {
          toast.success(`Moved ${participant.name} to ${toGroup.name || `Group ${toGroupIndex + 1}`}`);
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
  }, [selectedParticipant, tourGroups, updateParticipantGroup, updateTourGroups]);

  // Function to open the move dialog (renamed for clarity)
  const handleOpenMoveDialog = useCallback((data: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  }) => {
    setSelectedParticipant(data);
  }, []);

  // Function to close the move dialog (renamed for clarity)
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
