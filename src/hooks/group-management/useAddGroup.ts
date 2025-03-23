
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";
import { useModifications } from "../useModifications";
import { toast } from "sonner";

export const useAddGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  
  const addGroup = async () => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // Get the existing groups
      const currentGroups = tour.tourGroups;
      
      // Create a new group index
      const newGroupIndex = currentGroups.length + 1;
      
      // Create a new group
      const newGroup: VentrataTourGroup = {
        id: `temp-${Date.now()}`, // A temporary ID that will be replaced by the server
        name: `Group ${newGroupIndex}`,
        size: 0,
        childCount: 0,
        entryTime: "9:00", // Default entry time
        participants: []
      };
      
      // Add the new group to the tour
      const updatedTourGroups = [...currentGroups, newGroup];
      
      // Update the tour with the new group
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Record the modification
      addModification({
        description: `Added new group: ${newGroup.name}`,
        details: {
          type: "group_add",
          group: newGroup,
          timestamp: new Date().toISOString()
        }
      });
      
      // Refetch tour data to update UI
      await refetch();
      
      toast.success(`Added new group: ${newGroup.name}`);
      
      return true;
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to add group");
      throw error;
    }
  };
  
  return { addGroup };
};
