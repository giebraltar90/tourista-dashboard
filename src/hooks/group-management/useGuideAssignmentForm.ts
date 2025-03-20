
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "./useAssignGuide";
import { toast } from "sonner";
import { isValidUuid, mapSpecialGuideIdToUuid } from "@/services/api/utils/guidesUtils";

// Define form schema with Zod
const formSchema = z.object({
  guideId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GuideOption {
  id: string;
  name: string;
  info: GuideInfo | null;
}

interface UseGuideAssignmentFormProps {
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  onSuccess: () => void;
  tour?: any; // Pass tour data for mapping guide IDs
}

export const useGuideAssignmentForm = ({
  tourId,
  groupIndex,
  guides,
  currentGuideId,
  onSuccess,
  tour
}: UseGuideAssignmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  
  // Track the current guide ID for form state
  const [currentValue, setCurrentValue] = useState(currentGuideId || "_none");
  
  // Update form value when currentGuideId prop changes
  useEffect(() => {
    setCurrentValue(currentGuideId || "_none");
    form.setValue("guideId", currentGuideId || "_none");
  }, [currentGuideId]);
  
  // Debug log for troubleshooting
  console.log("useGuideAssignmentForm initialized with:", {
    tourId,
    groupIndex,
    guidesCount: guides.length,
    currentGuideId,
    currentValue,
    availableGuideIds: guides.map(g => ({id: g.id, name: g.name}))
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: currentValue,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    // If no change, just close the dialog
    if (values.guideId === currentValue) {
      onSuccess();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Map special guide IDs (like guide1) to actual UUIDs if we have tour data
      let guideIdToAssign: string | null = values.guideId as string;
      
      if (guideIdToAssign !== "_none") {
        // If it's not a UUID, try to map it to one using the tour data
        if (!isValidUuid(guideIdToAssign)) {
          guideIdToAssign = mapSpecialGuideIdToUuid(guideIdToAssign, tour);
          console.log("Mapped special guide ID to UUID:", { 
            original: values.guideId, 
            mapped: guideIdToAssign 
          });
          
          // If mapping failed, show an error
          if (guideIdToAssign === null) {
            console.error(`Failed to map special guide ID "${values.guideId}" to a valid UUID`);
            toast.error("Cannot assign guide: Could not map to a valid guide ID");
            setIsSubmitting(false);
            return;
          }
        }
      }
      
      console.log("Assigning guide:", { 
        groupIndex, 
        guideId: guideIdToAssign,
        originalGuideId: values.guideId,
        currentGuideId,
        selectedGuide: guides.find(g => g.id === values.guideId)?.name
      });
      
      // Call the assign guide function with the selected guide ID
      const success = await assignGuide(groupIndex, guideIdToAssign);
      
      if (success) {
        // Update the current value to match the form
        setCurrentValue(values.guideId || "_none");
        onSuccess();
      } else {
        toast.error("Failed to assign guide. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      // Always reset the submitting state, even if there's an error
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveGuide = async () => {
    try {
      setIsSubmitting(true);
      
      console.log("Removing guide from group:", { groupIndex });
      
      // Use "_none" as special value to remove the guide
      const success = await assignGuide(groupIndex, "_none");
      
      if (success) {
        // Update the current value to reflect the removed guide
        setCurrentValue("_none");
        onSuccess();
      } else {
        toast.error("Failed to remove guide. Please try again.");
      }
    } catch (error) {
      console.error("Error removing guide:", error);
      toast.error("Failed to remove guide");
    } finally {
      // Always reset the submitting state, even if there's an error
      setIsSubmitting(false);
    }
  };
  
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
