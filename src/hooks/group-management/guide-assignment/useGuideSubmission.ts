
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { processGuideIdForAssignment } from "../utils/guideAssignmentUtils";
import { FormValues } from "./types";
import { GuideOption } from "../types";
import { applyOptimisticUpdate, handleOptimisticError, refreshDataAfterSuccess } from "./formUtils";
import { logger } from "@/utils/logger";
import { toast } from "sonner";

/**
 * Hook for handling guide submission logic
 */
export const useGuideSubmission = (
  tourId: string,
  groupIndex: number,
  guides: GuideOption[],
  currentValue: string,
  assignGuideFunction: (groupIndex: number, guideId: string) => Promise<boolean>,
  onSuccessCallback: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Handle form submission to assign a guide
   */
  const handleSubmit = async (values: FormValues): Promise<void> => {
    // If no change, just close the dialog
    if (values.guideId === currentValue) {
      onSuccessCallback();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const selectedGuideId = values.guideId as string;
      
      logger.debug("Assigning guide:", { 
        groupIndex, 
        guideId: selectedGuideId,
        selectedGuide: guides.find(g => g.id === values.guideId)?.name
      });
      
      // Process the guide ID to ensure it's a valid UUID if not "_none"
      const processedGuideId = processGuideIdForAssignment(selectedGuideId, guides);
      
      // Apply optimistic update for a better user experience
      if (processedGuideId !== undefined) {
        applyOptimisticUpdate(queryClient, tourId, groupIndex, processedGuideId);
      }
      
      // Call the assign guide function with the selected ID
      const success = await assignGuideFunction(groupIndex, selectedGuideId);
      
      if (success) {
        refreshDataAfterSuccess(queryClient, tourId);
        onSuccessCallback();
      } else {
        toast.error("Failed to assign guide. Please try again.");
        handleOptimisticError(queryClient, tourId);
      }
    } catch (error) {
      logger.error("Error assigning guide:", error);
      handleOptimisticError(queryClient, tourId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
