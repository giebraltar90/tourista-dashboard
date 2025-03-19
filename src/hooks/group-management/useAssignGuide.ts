
import { useTourById } from "../useTourData";
import { useGuideData } from "../useGuideData";
import { useModifications } from "../useModifications";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processGuideAssignment } from "./services/guideAssignmentProcessor";
import { recordGuideAssignmentModification } from "./services/guideAssignmentService";

/**
 * Hook to assign or unassign guides to tour groups
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour } = useTourById(tourId);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  const pendingAssignmentsRef = useRef<Map<number, string | undefined>>(new Map());
  
  /**
   * Assign a guide to a specific group
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string) => {
    try {
      // Store this pending assignment to protect against race conditions
      pendingAssignmentsRef.current.set(groupIndex, guideId);
      
      const result = await processGuideAssignment(
        tourId,
        groupIndex,
        tour,
        guides,
        guideId === "_none" ? undefined : guideId,
        queryClient
      );
      
      if (result.success) {
        // Record the modification
        await recordGuideAssignmentModification(
          tourId,
          groupIndex,
          guideId === "_none" ? undefined : guideId,
          result.guideName,
          result.groupName,
          addModification
        );
      }
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      // IMPROVEMENT: Force a more immediate background refresh to ensure data consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 1000);
      
      return result.success;
    } catch (error) {
      console.error("Error assigning guide:", error);
      
      // Clear the pending assignment
      pendingAssignmentsRef.current.delete(groupIndex);
      
      throw error;
    }
  }, [tour, tourId, guides, addModification, queryClient]);
  
  return { assignGuide };
};
