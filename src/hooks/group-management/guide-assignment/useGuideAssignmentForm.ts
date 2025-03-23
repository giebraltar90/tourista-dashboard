
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAssignGuide } from "../useAssignGuide";
import { useQueryClient } from "@tanstack/react-query";
import { FormValues, UseGuideAssignmentFormProps, UseGuideAssignmentFormResult, formSchema } from "./types";
import { useGuideSubmission } from "./useGuideSubmission";
import { useGuideRemoval } from "./useGuideRemoval";
import { logger } from "@/utils/logger";

/**
 * Hook for handling guide assignment form functionality
 */
export const useGuideAssignmentForm = ({
  tourId,
  groupIndex,
  guides,
  currentGuideId,
  onSuccess,
  tour
}: UseGuideAssignmentFormProps): UseGuideAssignmentFormResult => {
  const [currentValue, setCurrentValue] = useState(currentGuideId || "_none");
  const { assignGuide } = useAssignGuide(tourId);
  const queryClient = useQueryClient();
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: currentValue,
    },
  });
  
  // Debug log for troubleshooting
  useEffect(() => {
    logger.debug("useGuideAssignmentForm initialized with:", {
      tourId,
      groupIndex,
      guidesCount: guides.length,
      currentGuideId,
      currentValue,
      guides: guides.map(g => ({ id: g.id, name: g.name }))
    });
  }, [tourId, groupIndex, guides, currentGuideId, currentValue]);

  // Update form value when currentGuideId prop changes
  useEffect(() => {
    const newValue = currentGuideId || "_none";
    setCurrentValue(newValue);
    form.setValue("guideId", newValue);
  }, [currentGuideId, form]);
  
  // Use our submission hook for handling form submission
  const { isSubmitting, handleSubmit } = useGuideSubmission(
    tourId,
    groupIndex,
    guides,
    currentValue,
    assignGuide,
    () => {
      onSuccess();
      setCurrentValue(form.getValues().guideId || "_none");
    }
  );
  
  // Use our removal hook for handling guide removal
  const { handleRemoveGuide } = useGuideRemoval(
    tourId, 
    groupIndex, 
    assignGuide
  );
  
  // Derived state
  const hasChanges = form.getValues().guideId !== currentValue;
  const hasCurrentGuide = currentGuideId !== undefined && currentGuideId !== null && currentGuideId !== "_none";
  
  return {
    form,
    isSubmitting,
    handleSubmit,
    handleRemoveGuide,
    hasChanges,
    hasCurrentGuide
  };
};
