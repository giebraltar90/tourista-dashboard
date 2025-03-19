import { useTourById } from "../useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "../useGuideData";
import { toast } from "sonner";
import { useModifications } from "../useModifications";

export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides } = useGuideData();
  const { addModification } = useModifications(tourId);
  
  const assignGuide = async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // If guideId is "_none", treat it as undefined to unassign the guide
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // Find guide name for the modification description
      let guideName = "Unassigned";
      
      if (actualGuideId) {
        // Primary guides
        if (actualGuideId === "guide1") {
          guideName = tour.guide1;
        } else if (actualGuideId === "guide2") {
          guideName = tour.guide2 || "Guide 2";
        } else if (actualGuideId === "guide3") {
          guideName = tour.guide3 || "Guide 3";
        } else {
          // Try to find guide by ID
          const guide = guides.find(g => g.id === actualGuideId);
          if (guide) {
            guideName = guide.name;
          } else if (tour.guide1 && actualGuideId.includes(tour.guide1)) {
            guideName = tour.guide1;
          } else if (tour.guide2 && actualGuideId.includes(tour.guide2)) {
            guideName = tour.guide2;
          } else if (tour.guide3 && actualGuideId.includes(tour.guide3)) {
            guideName = tour.guide3;
          }
        }
      }
      
      // Create a deep copy of tourGroups to avoid mutation issues
      const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      
      // Check if we should update the group name based on the guide
      let groupName = updatedTourGroups[groupIndex].name;
      
      // If the group name follows the pattern "X's Group", update it with new guide name
      // or if it's the first assignment, also update the name
      const namePattern = /^.+'s Group$/;
      if (namePattern.test(groupName) || groupName.includes("Group") || !updatedTourGroups[groupIndex].guideId) {
        if (guideName && guideName !== "Unassigned") {
          groupName = `${guideName}'s Group`;
        }
        // Keep the existing name if we're removing a guide or couldn't find a guide name
      }
      
      // Update the group with new guide ID and possibly new name
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
      
      // Call the API to update tour groups
      await updateTourGroups(tourId, updatedTourGroups);
      
      // Immediately refetch tour data to update UI
      await refetch();
      
      // Record this modification
      const modificationDescription = guideName !== "Unassigned"
        ? `Guide ${guideName} assigned to group ${updatedTourGroups[groupIndex].name}`
        : `Guide removed from group ${updatedTourGroups[groupIndex].name}`;
        
      await addModification(modificationDescription, {
        type: "guide_assignment",
        groupIndex,
        guideId: actualGuideId,
        guideName,
        groupName: updatedTourGroups[groupIndex].name
      });
      
      // Show toast notification based on the action
      if (guideName !== "Unassigned") {
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
