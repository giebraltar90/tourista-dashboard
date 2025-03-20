import { Form } from "@/components/ui/form";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectField } from "./GuideSelectField";
import { FormActions } from "./FormActions";
import { useGuideAssignmentForm } from "@/hooks/group-management/useGuideAssignmentForm";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
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
    
    // Then process special guides (guide1, guide2, etc.) - try to find their UUIDs
    guides
      .filter(guide => guide && guide.name && !isValidUuid(guide.id))
      .forEach(guide => {
        if (!processedGuideNames.has(guide.name)) {
          // For special IDs, try to find the corresponding database guide
          const databaseGuide = allDatabaseGuides.find(dbGuide => 
            dbGuide.name === guide.name
          );
          
          if (databaseGuide && isValidUuid(databaseGuide.id)) {
            // Use the database guide with valid UUID
            uniqueGuides.push({
              id: databaseGuide.id,
              name: databaseGuide.name,
              info: guide.info || databaseGuide
            });
            processedGuideNames.add(guide.name);
            console.log(`Mapped special guide "${guide.name}" to UUID: ${databaseGuide.id}`);
          } else {
            // If no UUID mapping found, still include the guide with its original ID
            uniqueGuides.push(guide);
            processedGuideNames.add(guide.name);
            console.log(`Couldn't find UUID for guide "${guide.name}" - keeping original ID: ${guide.id}`);
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
  }, [guides, allDatabaseGuides]);
  
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
