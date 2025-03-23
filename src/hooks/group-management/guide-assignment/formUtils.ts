
import { processGuideIdForAssignment } from "../utils/guideAssignmentUtils";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { QueryClient } from "@tanstack/react-query";

/**
 * Applies an optimistic update to the UI before the API call completes
 */
export const applyOptimisticUpdate = (
  queryClient: QueryClient,
  tourId: string,
  groupIndex: number,
  processedGuideId: string | null | undefined
) => {
  const updatedData = queryClient.getQueryData(['tour', tourId]);
  if (updatedData) {
    queryClient.setQueryData(['tour', tourId], (oldData: any) => {
      if (!oldData || !oldData.tourGroups) return oldData;
      
      const newData = JSON.parse(JSON.stringify(oldData));
      if (newData.tourGroups[groupIndex]) {
        newData.tourGroups[groupIndex].guideId = processedGuideId;
        
        // Update group name to reflect guide assignment
        if (processedGuideId) {
          const guideName = "Updated Guide"; // This will be replaced by server response
          newData.tourGroups[groupIndex].name = processedGuideId 
            ? `Group ${groupIndex + 1} (${guideName})` 
            : `Group ${groupIndex + 1}`;
        } else {
          newData.tourGroups[groupIndex].name = `Group ${groupIndex + 1}`;
        }
      }
      
      return newData;
    });
  }
};

/**
 * Handles rolling back optimistic updates on error
 */
export const handleOptimisticError = (
  queryClient: QueryClient,
  tourId: string
) => {
  logger.error("Error assigning guide - rolling back optimistic update");
  queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
  toast.error("Failed to assign guide");
};

/**
 * Refreshes data after a successful guide assignment
 */
export const refreshDataAfterSuccess = (
  queryClient: QueryClient,
  tourId: string
) => {
  // Force a data refresh after a short delay
  setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    queryClient.invalidateQueries({ queryKey: ['tours'] });
  }, 500);
};
