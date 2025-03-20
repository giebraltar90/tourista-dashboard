import { Form } from "@/components/ui/form";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectField } from "./GuideSelectField";
import { FormActions } from "./FormActions";
import { useGuideAssignmentForm } from "@/hooks/group-management/useGuideAssignmentForm";
import { isValidUuid, mapSpecialGuideIdToUuid } from "@/services/api/utils/guidesUtils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTourById } from "@/hooks/tourData/useTourById";
import { useGuideData } from "@/hooks/guides/useGuideData";

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
  const { guides: allDatabaseGuides = [] } = useGuideData() || { guides: [] };
  
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
    
    // Then process special guides (guide1, guide2, etc.)
    guides
      .filter(guide => guide && guide.name && !isValidUuid(guide.id))
      .forEach(guide => {
        if (!processedGuideNames.has(guide.name)) {
          // Try to map the special ID to UUID
          if (tour) {
            const enhancedTour = {
              ...tour,
              guides: allDatabaseGuides // Add all guides to tour for better mapping
            };
            
            const uuid = mapSpecialGuideIdToUuid(guide.id, enhancedTour);
            if (uuid) {
              console.log(`Mapped ${guide.id} (${guide.name}) to UUID: ${uuid}`);
              // Add the guide with the mapped UUID
              uniqueGuides.push({
                ...guide,
                id: uuid // Replace the special ID with the UUID
              });
              processedGuideNames.add(guide.name);
            } else {
              // If mapping failed, still include the guide with its original ID
              uniqueGuides.push(guide);
              processedGuideNames.add(guide.name);
            }
          } else {
            // If no tour data, keep the guide as is
            uniqueGuides.push(guide);
            processedGuideNames.add(guide.name);
          }
        }
      });
    
    console.log("AssignGuideForm processed guides:", {
      originalCount: guides.length,
      processedCount: uniqueGuides.length,
      currentGuideId,
      processedGuides: uniqueGuides.map(g => ({ id: g.id, name: g.name }))
    });
    
    setProcessedGuides(uniqueGuides);
  }, [guides, tour, allDatabaseGuides]);
  
  // Enhance tour data with guides for better ID mapping
  const enhancedTour = tour ? {
    ...tour,
    guides: allDatabaseGuides
  } : undefined;
  
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
    tour: enhancedTour // Pass enhanced tour data for mapping guide IDs
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
