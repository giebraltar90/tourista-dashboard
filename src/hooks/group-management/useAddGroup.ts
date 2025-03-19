
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";

export const useAddGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  
  const addGroup = async (newGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const updatedTourGroups = [...tour.tourGroups, newGroup];
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error adding group:", error);
      throw error;
    }
  };
  
  return { addGroup };
};
