
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { useModifications } from "../useModifications";

export const useUpdateGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  
  const updateGroup = async (groupIndex: number, updatedGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const originalGroup = tour.tourGroups[groupIndex];
      const updatedTourGroups = [...tour.tourGroups];
      updatedTourGroups[groupIndex] = updatedGroup;
      
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Record the modification
      const changes = [];
      if (originalGroup.name !== updatedGroup.name) {
        changes.push(`name changed from "${originalGroup.name}" to "${updatedGroup.name}"`);
      }
      if (originalGroup.size !== updatedGroup.size) {
        changes.push(`size changed from ${originalGroup.size} to ${updatedGroup.size}`);
      }
      if (originalGroup.entryTime !== updatedGroup.entryTime) {
        changes.push(`entry time changed from ${originalGroup.entryTime} to ${updatedGroup.entryTime}`);
      }
      
      if (changes.length > 0) {
        addModification({
          description: `Group "${updatedGroup.name}" updated: ${changes.join(", ")}`,
          details: {
            type: "group_update",
            groupIndex,
            originalGroup,
            updatedGroup
          }
        });
      }
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };
  
  return { updateGroup };
};
