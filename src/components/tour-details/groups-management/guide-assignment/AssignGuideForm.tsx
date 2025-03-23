
import { Form } from "@/components/ui/form";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectField } from "./GuideSelectField";
import { FormActions } from "./FormActions";
import { useGuideAssignmentForm } from "@/hooks/group-management/useGuideAssignmentForm";
import { useState, useEffect } from "react";
import { useTourById } from "@/hooks/tourData/useTourById";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { GuideOption } from "@/hooks/group-management/types";

interface AssignGuideFormProps {
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  onSuccess: () => void;
}

export const AssignGuideForm = ({ 
  tourId, 
  groupIndex, 
  guides, 
  currentGuideId, 
  onSuccess 
}: AssignGuideFormProps) => {
  // Use the useGuideData hook to fetch all guides
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  const { data: tour } = useTourById(tourId);
  
  // Store processed guides in state to prevent re-processing on every render
  const [processedGuides, setProcessedGuides] = useState<GuideOption[]>([]);
  
  // Process guides only once when the component mounts or guides change
  useEffect(() => {
    // Map all guides to the GuideOption format
    const allProcessedGuides = allGuides.map(guide => ({
      id: guide.id || '', // Ensure ID is never undefined
      name: guide.name,
      info: guide
    }));
    
    // Add any provided guides that aren't in allGuides
    guides.forEach(guide => {
      if (!allProcessedGuides.some(g => g.id === guide.id)) {
        allProcessedGuides.push(guide);
      }
    });
    
    // Sort guides by name for better UX
    allProcessedGuides.sort((a, b) => a.name.localeCompare(b.name));
    
    setProcessedGuides(allProcessedGuides);
    
    console.log("AssignGuideForm - processed guides:", allProcessedGuides.length);
  }, [allGuides, guides]);
  
  // Use our custom hook to get form logic
  const {
    form,
    isSubmitting,
    handleSubmit,
    handleRemoveGuide,
    hasChanges,
    hasCurrentGuide
  } = useGuideAssignmentForm({
    tourId,
    groupIndex,
    guides: processedGuides,
    currentGuideId,
    onSuccess,
    tour
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <GuideSelectField 
          form={form} 
          guides={processedGuides} 
          defaultValue={currentGuideId || "_none"} 
        />
        
        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={onSuccess}
          onRemove={handleRemoveGuide}
          hasCurrentGuide={hasCurrentGuide}
          hasChanges={hasChanges}
        />
      </form>
    </Form>
  );
};
