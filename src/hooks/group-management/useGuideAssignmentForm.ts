
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignGuide } from "./useAssignGuide";
import { toast } from "sonner";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { 
  FormValues, 
  UseGuideAssignmentFormProps, 
  UseGuideAssignmentFormResult 
} from "./types";
import { processGuideIdForAssignment } from "./utils/guideAssignmentUtils";

// Define form schema with Zod
const formSchema = z.object({
  guideId: z.string().optional(),
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  const [currentValue, setCurrentValue] = useState(currentGuideId || "_none");
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: currentValue,
    },
  });
  
  // Debug log for troubleshooting
  useEffect(() => {
    console.log("useGuideAssignmentForm initialized with:", {
      tourId,
      groupIndex,
      guidesCount: guides.length,
      currentGuideId,
      currentValue,
      availableGuideIds: guides.map(g => ({id: g.id, name: g.name}))
    });
  }, [tourId, groupIndex, guides, currentGuideId, currentValue]);

  // Update form value when currentGuideId prop changes
  useEffect(() => {
    setCurrentValue(currentGuideId || "_none");
    form.setValue("guideId", currentGuideId || "_none");
  }, [currentGuideId, form]);
  
  /**
   * Handle form submission to assign a guide
   */
  const handleSubmit = async (values: FormValues) => {
    // If no change, just close the dialog
    if (values.guideId === currentValue) {
      onSuccess();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Process guide ID for assignment
      const guideIdToAssign = processGuideIdForAssignment(
        values.guideId as string,
        guides,
        allGuides,
        tour
      );
      
      // If mapping failed, show an error
      if (values.guideId !== "_none" && guideIdToAssign === null) {
        console.error(`Failed to map guide ID "${values.guideId}" to a valid UUID`);
        toast.error("Cannot assign guide: Could not map to a valid guide ID");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Assigning guide:", { 
        groupIndex, 
        guideId: guideIdToAssign,
        originalGuideId: values.guideId,
        currentGuideId,
        selectedGuide: guides.find(g => g.id === values.guideId)?.name
      });
      
      // Get the actual group ID if available, otherwise fall back to index
      const groupId = String(groupIndex); // Convert to string to ensure consistency
      
      // Call the assign guide function
      const success = await assignGuide(groupId, guideIdToAssign || "_none");
      
      handleAssignmentResult(success, values.guideId);
    } catch (error) {
      handleAssignmentError(error);
    }
  };
  
  /**
   * Handle removing a guide from a group
   */
  const handleRemoveGuide = async () => {
    try {
      setIsSubmitting(true);
      console.log("Removing guide from group:", { groupIndex });
      
      // Convert the groupIndex to a string for consistency
      const groupId = String(groupIndex);
      
      // Use "_none" as special value to remove the guide
      const success = await assignGuide(groupId, "_none");
      
      handleAssignmentResult(success, "_none");
    } catch (error) {
      handleAssignmentError(error);
    }
  };
  
  /**
   * Handle the result of guide assignment operation
   */
  const handleAssignmentResult = (success: boolean, newValue?: string | null) => {
    if (success) {
      // Update the current value to match the form
      setCurrentValue(newValue || "_none");
      onSuccess();
    } else {
      toast.error("Failed to assign guide. Please try again.");
    }
    setIsSubmitting(false);
  };
  
  /**
   * Handle errors during guide assignment
   */
  const handleAssignmentError = (error: unknown) => {
    console.error("Error assigning guide:", error);
    toast.error("Failed to assign guide");
    setIsSubmitting(false);
  };
  
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
