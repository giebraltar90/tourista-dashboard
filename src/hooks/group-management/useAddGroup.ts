
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useModifications } from "../useModifications";

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
  
  return { addGroup };
};
