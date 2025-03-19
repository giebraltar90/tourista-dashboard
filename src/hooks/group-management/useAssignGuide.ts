
import { useTourById } from "../useTourData";
import { useGuideData } from "../useGuideData";
import { useModifications } from "../useModifications";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processGuideAssignment } from "./services/guideAssignmentProcessor";
import { recordGuideAssignmentModification } from "./services/guideAssignmentService";

/**
 * Hook to assign or unassign guides to tour groups with improved debouncing
 * and race condition prevention
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour } = useTourById(tourId);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  const pendingAssignmentsRef = useRef<Map<number, { guideId: string | undefined, timestamp: number }>>(new Map());
  
  /**
   * Assign a guide to a specific group with improved race condition prevention
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string) => {
    try {
      if (!tour) {
        console.error("Cannot assign guide: Tour data not available");
        return false;
      }
      
      const now = Date.now();
      const pendingAssignment = pendingAssignmentsRef.current.get(groupIndex);
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? undefined : guideId;
      
      // If there's already a pending assignment for this group that's less than 5 seconds old,
      // and it's for the same guide ID, we'll ignore this request to prevent race conditions
      if (pendingAssignment && 
          pendingAssignment.guideId === actualGuideId && 
          now - pendingAssignment.timestamp < 5000) {
        console.log("Ignoring duplicate assignment request:", { groupIndex, guideId });
        return true; // Return success so UI doesn't show error
      }
      
      // Store this pending assignment with a timestamp
      pendingAssignmentsRef.current.set(groupIndex, { 
        guideId: actualGuideId,
        timestamp: now
      });
      
      console.log("Processing guide assignment:", { 
        groupIndex, 
        actualGuideId, 
        pendingAssignments: [...pendingAssignmentsRef.current.entries()]
      });
      
      // Cancel any in-flight queries that might overwrite our optimistic update
      queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      const result = await processGuideAssignment(
        tourId,
        groupIndex,
        tour,
        guides,
        actualGuideId,
        queryClient
      );
      
      if (result.success) {
        // Record the modification
        await recordGuideAssignmentModification(
          tourId,
          groupIndex,
          actualGuideId,
          result.guideName,
          result.groupName,
          addModification
        );
      }
      
      // Clear the pending assignment after processing is complete
      // Use a longer debounce time of 5 seconds to prevent rapid changes
      setTimeout(() => {
        // Only clear if it's the same assignment we started with
        const current = pendingAssignmentsRef.current.get(groupIndex);
        if (current && current.timestamp === now) {
          pendingAssignmentsRef.current.delete(groupIndex);
        }
      }, 5000);
      
      // Avoid forced refreshes that could override our optimistic updates
      // Move background refreshes to only happen after a much longer delay
      
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
