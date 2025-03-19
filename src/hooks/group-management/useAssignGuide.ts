import { useTourById } from "../useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "../useGuideData";

export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides } = useGuideData();
  
  const assignGuide = async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // Find guide name for the group name update
      let guideName = "";
      if (guideId) {
        if (guideId === "guide1") {
          guideName = tour.guide1;
        } else if (guideId === "guide2" && tour.guide2) {
          guideName = tour.guide2;
        } else if (guideId === "guide3" && tour.guide3) {
          guideName = tour.guide3;
        } else {
          // Try to find the guide by ID in the guides data
          const guide = guides.find(g => g.id === guideId);
          if (guide) {
            guideName = guide.name;
          }
        }
      }
      
      const updatedTourGroups = [...tour.tourGroups];
      
      // Check if we should update the group name based on the guide
      let groupName = updatedTourGroups[groupIndex].name;
      
      // If the group name follows the pattern "X's Group", update it with new guide name
      const namePattern = /^.+'s Group$/;
      if (namePattern.test(groupName) || groupName.includes("Group")) {
        if (guideName) {
          groupName = `${guideName}'s Group`;
        } else {
          // Keep the existing name if we're removing a guide
        }
      }
      
      updatedTourGroups[groupIndex] = {
        ...updatedTourGroups[groupIndex],
        guideId,
        name: groupName
      };
      
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Refetch tour data to update UI
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error assigning guide:", error);
      throw error;
    }
  };
  
  return { assignGuide };
};
