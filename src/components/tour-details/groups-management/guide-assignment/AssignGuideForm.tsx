
import { Form } from "@/components/ui/form";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectField } from "./GuideSelectField";
import { FormActions } from "./FormActions";
import { useGuideAssignmentForm } from "@/hooks/group-management/useGuideAssignmentForm";
import { isValidUuid, mapSpecialGuideIdToUuid } from "@/services/api/utils/guidesUtils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTourById } from "@/hooks/tourData/useTourById";

interface GuideOption {
  id: string;
  name: string;
  info: GuideInfo | null;
}

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
  // Store processed guides in state to prevent re-processing on every render
  const [processedGuides, setProcessedGuides] = useState<GuideOption[]>([]);
  const { data: tour } = useTourById(tourId);
  
  // Process guides only once when the component mounts or guides change
  useEffect(() => {
    // Filter out duplicate guides by name, prioritizing valid UUID guides
    const uniqueGuides: GuideOption[] = [];
    const processedGuideNames = new Set<string>();
    
    // First process guides with valid UUIDs (from database)
    guides
      .filter(guide => guide && guide.name && isValidUuid(guide.id))
      .forEach(guide => {
        if (!processedGuideNames.has(guide.name)) {
          uniqueGuides.push(guide);
          processedGuideNames.add(guide.name);
        }
      });
    
    console.log("AssignGuideForm processed guides:", {
      originalCount: guides.length,
      processedCount: uniqueGuides.length,
      currentGuideId,
      processedGuides: uniqueGuides.map(g => ({ id: g.id, name: g.name }))
    });
    
    setProcessedGuides(uniqueGuides);
  }, [guides]);
  
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
    guides: processedGuides, // Use processed guides for form handling
    currentGuideId,
    onSuccess,
    tour // Pass tour data for mapping guide IDs
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <GuideSelectField 
          form={form} 
          guides={processedGuides} // Use processed guides for select options
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
