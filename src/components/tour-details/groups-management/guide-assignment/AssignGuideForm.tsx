
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
  // Store processed guides in state to prevent re-processing on every render
  const [processedGuides, setProcessedGuides] = useState<GuideOption[]>([]);
  const { data: tour } = useTourById(tourId);
  const { guides: allDatabaseGuides = [] } = useGuideData() || { guides: [] };
  
  // Process guides only once when the component mounts or guides change
  useEffect(() => {
    // Filter out duplicate guides by name
    const uniqueGuides: GuideOption[] = [];
    const processedGuideNames = new Set<string>();
    
    // Debug the incoming guide data
    console.log("Processing guides in AssignGuideForm:", 
      guides.map(g => ({ id: g.id, name: g.name }))
    );
    
    // First process all database guides to ensure they're available
    allDatabaseGuides.forEach(dbGuide => {
      if (dbGuide.name && !processedGuideNames.has(dbGuide.name)) {
        uniqueGuides.push({
          id: dbGuide.id,
          name: dbGuide.name,
          info: dbGuide
        });
        processedGuideNames.add(dbGuide.name);
      }
    });
    
    // Then process any special guides that weren't in the database
    guides.forEach(guide => {
      if (guide && guide.name && !processedGuideNames.has(guide.name)) {
        uniqueGuides.push(guide);
        processedGuideNames.add(guide.name);
        console.log(`Added guide: ${guide.name} with ID: ${guide.id}`);
      }
    });
    
    // Sort guides by name for better UX
    uniqueGuides.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("Final processed guides:", 
      uniqueGuides.map(g => ({ id: g.id, name: g.name }))
    );
    
    setProcessedGuides(uniqueGuides);
  }, [guides, allDatabaseGuides]);
  
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
    tour
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
