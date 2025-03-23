
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssignGuide } from "./useAssignGuide";
import { toast } from "sonner";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { processGuideIdForAssignment } from "./utils/guideAssignmentUtils";
import { useQueryClient } from "@tanstack/react-query";

// Define form schema with Zod
const formSchema = z.object({
  guideId: z.string().optional(),
});

export interface FormValues {
  guideId?: string;
}

export interface UseGuideAssignmentFormProps {
  tourId: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info: any | null;
  }>;
  currentGuideId?: string;
  onSuccess: () => void;
  tour?: any;
}

export interface UseGuideAssignmentFormResult {
  form: any;
  isSubmitting: boolean;
  handleSubmit: (values: FormValues) => Promise<void>;
  handleRemoveGuide: () => Promise<void>;
  hasChanges: boolean;
  hasCurrentGuide: boolean;
}

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
  const [currentValue, setCurrentValue] = useState(currentGuideId || "_none");
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
    console.log("useGuideAssignmentForm initialized with:", {
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
      
      const selectedGuideId = values.guideId as string;
      
      console.log("Assigning guide:", { 
        groupIndex, 
        guideId: selectedGuideId,
        currentGuideId,
        selectedGuide: guides.find(g => g.id === values.guideId)?.name
      });
      
      // Process the guide ID to ensure it's a valid UUID if not "_none"
      const processedGuideId = processGuideIdForAssignment(selectedGuideId, guides);
      
      // Apply optimistic update for a better user experience
      if (processedGuideId !== undefined) {
        const updatedData = queryClient.getQueryData(['tour', tourId]);
        if (updatedData) {
          queryClient.setQueryData(['tour', tourId], (oldData: any) => {
            if (!oldData || !oldData.tourGroups) return oldData;
            
            const newData = JSON.parse(JSON.stringify(oldData));
            if (newData.tourGroups[groupIndex]) {
              newData.tourGroups[groupIndex].guideId = processedGuideId;
              
              // Update group name to reflect guide assignment
              const guideName = guides.find(g => g.id === processedGuideId)?.name || "Unknown";
              newData.tourGroups[groupIndex].name = processedGuideId 
                ? `Group ${groupIndex + 1} (${guideName})` 
                : `Group ${groupIndex + 1}`;
            }
            
            return newData;
          });
        }
      }
      
      // Call the assign guide function with the selected ID
      const success = await assignGuide(groupIndex, selectedGuideId);
      
      if (success) {
        // Update the current value to match the form
        setCurrentValue(selectedGuideId);
        
        // Force a data refresh after a short delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
        }, 500);
        
        onSuccess();
      } else {
        toast.error("Failed to assign guide. Please try again.");
        
        // Roll back optimistic update on failure
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
      
      // Roll back optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handle removing a guide from a group
   */
  const handleRemoveGuide = async () => {
    try {
      setIsSubmitting(true);
      console.log("Removing guide from group:", { groupIndex });
      
      // Apply optimistic update for a better user experience
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData || !oldData.tourGroups) return oldData;
        
        const newData = JSON.parse(JSON.stringify(oldData));
        if (newData.tourGroups[groupIndex]) {
          newData.tourGroups[groupIndex].guideId = null;
          newData.tourGroups[groupIndex].name = `Group ${groupIndex + 1}`;
        }
        
        return newData;
      });
      
      // Use "_none" as special value to remove the guide
      const success = await assignGuide(groupIndex, "_none");
      
      if (success) {
        // Update the current value to match the form
        setCurrentValue("_none");
        
        // Force a data refresh after a short delay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
          queryClient.invalidateQueries({ queryKey: ['tours'] });
        }, 500);
        
        onSuccess();
      } else {
        toast.error("Failed to remove guide. Please try again.");
        
        // Roll back optimistic update on failure
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }
    } catch (error) {
      console.error("Error removing guide:", error);
      toast.error("Failed to remove guide");
      
      // Roll back optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    } finally {
      setIsSubmitting(false);
    }
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
