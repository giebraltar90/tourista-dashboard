
import { useTourById } from "../useTourData";
import { VentrataTourGroup } from "@/types/ventrata";
import { updateTourGroups } from "@/services/ventrataApi";

export const useUpdateGroup = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  
  const updateGroup = async (groupIndex: number, updatedGroup: VentrataTourGroup) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      const updatedTourGroups = [...tour.tourGroups];
      updatedTourGroups[groupIndex] = updatedGroup;
      
      await updateTourGroups(tourId, updatedTourGroups);
      
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
