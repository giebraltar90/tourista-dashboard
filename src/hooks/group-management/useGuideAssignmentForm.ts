
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "./useAssignGuide";
import { toast } from "sonner";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
}

export const useGuideAssignmentForm = ({
  tourId,
  groupIndex,
  guides,
  currentGuideId,
  onSuccess
}: UseGuideAssignmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  
  // Set the default value to "_none" if no guide is assigned
  const defaultGuideId = currentGuideId || "_none";
  
  console.log("useGuideAssignmentForm initialized with:", {
    tourId,
    groupIndex,
    guidesCount: guides.length,
    currentGuideId,
    defaultGuideId,
    availableGuideIds: guides.map(g => ({id: g.id, name: g.name}))
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: defaultGuideId,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    // If no change, just close the dialog
    if (values.guideId === defaultGuideId) {
      onSuccess();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validate that if a guide ID is provided, it must be a valid UUID (except for _none)
      if (values.guideId && values.guideId !== "_none" && !isValidUuid(values.guideId)) {
        console.error(`Invalid guide ID format selected: ${values.guideId}. Must be a valid UUID.`);
        toast.error("Cannot assign guide: Invalid guide ID format");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Assigning guide:", { 
        groupIndex, 
        guideId: values.guideId,
        currentGuideId,
        selectedGuide: guides.find(g => g.id === values.guideId)?.name
      });
      
      // Call the assign guide function with the selected guide ID
      const success = await assignGuide(groupIndex, values.guideId);
      
      if (success) {
        toast.success("Guide assigned successfully");
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
        toast.success("Guide removed successfully");
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
  
  const hasChanges = form.getValues().guideId !== defaultGuideId;
  const hasCurrentGuide = !!currentGuideId && currentGuideId !== "_none";
  
  return {
    form,
    isSubmitting,
    handleSubmit,
    handleRemoveGuide,
    hasChanges,
    hasCurrentGuide
  };
};
