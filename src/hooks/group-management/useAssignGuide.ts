import { useTourById } from "../useTourData";
import { updateTourGroups } from "@/services/ventrataApi";
import { useGuideData } from "../useGuideData";
import { toast } from "sonner";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to assign or unassign guides to tour groups
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides } = useGuideData();
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  
  /**
   * Find guide name based on guide ID
   */
  const findGuideName = useCallback((guideId?: string) => {
    if (!guideId || guideId === "_none") return "Unassigned";
    if (!tour) return "Unknown";
    
    // Check primary guides first
    if (guideId === "guide1") return tour.guide1;
    if (guideId === "guide2") return tour.guide2 || "Guide 2";
    if (guideId === "guide3") return tour.guide3 || "Guide 3";
    
    // Try to find guide by ID
    const guide = guides.find(g => g.id === guideId);
    if (guide) return guide.name;
    
    // Check if ID contains guide name (fallback)
    if (tour.guide1 && guideId.includes(tour.guide1)) return tour.guide1;
    if (tour.guide2 && guideId.includes(tour.guide2)) return tour.guide2;
    if (tour.guide3 && guideId.includes(tour.guide3)) return tour.guide3;
    
    return guideId;
  }, [tour, guides]);
  
  /**
   * Generate a group name based on guide assignment
   */
  const generateGroupName = useCallback((currentName: string, guideName: string) => {
    const namePattern = /^.+'s Group$/;
    
    // If the group name follows the pattern "X's Group", update it with new guide name
    // or if it's the first assignment or contains "Group", also update the name
    if (namePattern.test(currentName) || currentName.includes("Group")) {
      if (guideName && guideName !== "Unassigned") {
        return `${guideName}'s Group`;
      }
    }
    
    // Keep the existing name if we're removing a guide or couldn't find a pattern match
    return currentName;
  }, []);
  
  /**
   * Assign a guide to a specific group
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) throw new Error("Tour not found");
      
      // If guideId is "_none", treat it as undefined to unassign the guide
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // Find guide name for the modification description
      const guideName = findGuideName(actualGuideId);
      
      // Create a deep copy of tourGroups to avoid mutation issues
      const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
      
      // Get the current group name
      let groupName = updatedTourGroups[groupIndex].name;
      
      // Generate a new group name if needed
      const newGroupName = generateGroupName(groupName, guideName);
      
      // Update the group with new guide ID and possibly new name
      updatedTourGroups[groupIndex] = {
        ...updatedTourGroups[groupIndex],
        guideId: actualGuideId,
        name: newGroupName
      };
      
      // Call the API to update tour groups
      await updateTourGroups(tourId, updatedTourGroups);
      
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
      
      // Aggressive cache invalidation to ensure UI updates
      queryClient.invalidateQueries();
      
      // Immediately refetch tour data
      await refetch();
      
      // Update tour data in the queryClient cache directly
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return {
          ...oldData,
          tourGroups: updatedTourGroups
        };
      });
      
      // Notify about successful assignment
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
  }, [tour, tourId, findGuideName, generateGroupName, refetch, addModification, queryClient]);
  
  return { assignGuide };
};
