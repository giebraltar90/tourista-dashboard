
import { useTourById } from "../useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "../useGuideData";
import { toast } from "sonner";

export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides } = useGuideData();
  
  const assignGuide = async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // If guideId is "_none", treat it as undefined to unassign the guide
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // Find guide name for the group name update
      let guideName = "";
      if (actualGuideId) {
        // Check for primary guides first
        if (actualGuideId === "guide1" || (tour.guide1 && tour.guide1.includes(actualGuideId))) {
          guideName = tour.guide1;
        } else if (actualGuideId === "guide2" || (tour.guide2 && tour.guide2.includes(actualGuideId))) {
          guideName = tour.guide2;
        } else if (actualGuideId === "guide3" || (tour.guide3 && tour.guide3.includes(actualGuideId))) {
          guideName = tour.guide3;
        } else {
          // Try to find the guide by ID in the guides data
          const guide = guides.find(g => g.id === actualGuideId);
          if (guide) {
            guideName = guide.name;
          }
        }
      }
      
      // Log the guide identification process
      console.log("Guide assignment debug:", {
        guideId: actualGuideId,
        guideName,
        guide1: tour.guide1,
        guide2: tour.guide2,
        guide3: tour.guide3,
        guidesFromContext: guides.map(g => ({ id: g.id, name: g.name })),
        originalGroup: tour.tourGroups[groupIndex]
      });
      
      const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      
      // Check if we should update the group name based on the guide
      let groupName = updatedTourGroups[groupIndex].name;
      
      // If the group name follows the pattern "X's Group", update it with new guide name
      // or if it's the first assignment, also update the name
      const namePattern = /^.+'s Group$/;
      if (namePattern.test(groupName) || groupName.includes("Group") || !updatedTourGroups[groupIndex].guideId) {
        if (guideName) {
          groupName = `${guideName}'s Group`;
        }
        // Keep the existing name if we're removing a guide or couldn't find a guide name
      }
      
      updatedTourGroups[groupIndex] = {
        ...updatedTourGroups[groupIndex],
        guideId: actualGuideId,
        name: groupName
      };
      
      // Log for debugging
      console.log("Assigning guide to group:", { 
        groupIndex, 
        guideId: actualGuideId, 
        guideName,
        updatedGroup: updatedTourGroups[groupIndex]
      });
      
      const result = await updateTourGroups(tourId, updatedTourGroups);
      console.log("Update API response:", result);
      
      // Refetch tour data to update UI
      await refetch();
      
      if (guideName) {
        toast.success(`Guide ${guideName} assigned to group successfully`);
      } else {
        toast.success("Guide removed from group");
      }
      
      return true;
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide to group");
      throw error;
    }
  };
  
  return { assignGuide };
};
