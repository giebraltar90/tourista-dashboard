
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { applyOptimisticUpdate, handleOptimisticError, refreshDataAfterSuccess } from "./formUtils";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

/**
 * Hook for handling guide removal functionality
 */
export const useGuideRemoval = (
  tourId: string,
  groupIndex: number,
  assignGuideFunction: (groupIndex: number, guideId: string) => Promise<boolean>
) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Handle removing a guide from a group
   */
  const handleRemoveGuide = async (): Promise<void> => {
    try {
      setIsRemoving(true);
      logger.debug("Removing guide from group:", { groupIndex });
      
      // Apply optimistic update for a better user experience
      applyOptimisticUpdate(queryClient, tourId, groupIndex, null);
      
      // Use "_none" as special value to remove the guide
      const success = await assignGuideFunction(groupIndex, "_none");
      
      if (success) {
        refreshDataAfterSuccess(queryClient, tourId);
        toast.success("Guide removed from group");
      } else {
        handleOptimisticError(queryClient, tourId);
      }
    } catch (error) {
      logger.error("Error removing guide:", error);
      handleOptimisticError(queryClient, tourId);
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    isRemoving,
    handleRemoveGuide
  };
};
