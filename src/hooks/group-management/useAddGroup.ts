
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModifications } from "../useModifications";
import { calculateTotalParticipants } from "./services/participantService";

export const useAddGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const queryClient = useQueryClient();
  const { addModification } = useModifications(tourId);
  
  const addGroup = async (newGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // Make sure we initialize all required fields
      const completeNewGroup = {
        ...newGroup,
        size: newGroup.size || 0,
        participants: newGroup.participants || []
      };
      
      console.log("Adding new group:", completeNewGroup);
      
      const updatedTourGroups = [...tour.tourGroups, completeNewGroup];
      const result = await updateTourGroups(tourId, updatedTourGroups);
      
      console.log("Add group API response:", result);
      
      // Record the modification
      await addModification(
        `New group "${completeNewGroup.name}" added`,
        {
          type: "group_add",
          group: completeNewGroup
        }
      );
      
      // Forcefully invalidate queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to add group");
      throw error;
    }
  };
  
  // Function to automatically split into groups if total participants >= 15
  const autoSplitGroups = async () => {
    try {
      if (!tour || !tour.tourGroups) return false;
      
      const totalParticipants = calculateTotalParticipants(tour.tourGroups);
      
      // If less than 15 participants or already more than one group, no need to split
      if (totalParticipants < 15 || tour.tourGroups.length > 1) {
        return false;
      }
      
      const currentGroup = tour.tourGroups[0];
      const participants = currentGroup.participants || [];
      
      // Need at least 2 participants to split
      if (participants.length < 2) {
        return false;
      }
      
      // Calculate roughly half the participants for each group
      const midPoint = Math.ceil(participants.length / 2);
      
      // Create two groups with participants split between them
      const group1Participants = participants.slice(0, midPoint);
      const group2Participants = participants.slice(midPoint);
      
      // Calculate sizes and child counts for each group
      const group1Size = group1Participants.reduce((sum, p) => sum + (p.count || 1), 0);
      const group2Size = group2Participants.reduce((sum, p) => sum + (p.count || 1), 0);
      
      const group1ChildCount = group1Participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
      const group2ChildCount = group2Participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
      
      // Create the new groups
      const newGroups = [
        {
          ...currentGroup,
          name: `Group 1`,
          participants: group1Participants,
          size: group1Size,
          childCount: group1ChildCount
        },
        {
          ...currentGroup,
          id: undefined, // Will be assigned by the backend
          name: `Group 2`,
          participants: group2Participants,
          size: group2Size,
          childCount: group2ChildCount,
          guideId: tour.guide2 ? tour.guide2 : undefined // Assign second guide if available
        }
      ];
      
      const result = await updateTourGroups(tourId, newGroups);
      
      // Record the modification
      await addModification(
        `Groups automatically split due to high participant count (${totalParticipants})`,
        {
          type: "group_split",
          reason: "auto_15_plus",
          totalParticipants,
          newGroupCount: 2
        }
      );
      
      // Forcefully invalidate queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error auto-splitting groups:", error);
      toast.error("Failed to auto-split groups");
      return false;
    }
  };
  
  return { addGroup, autoSplitGroups };
};
