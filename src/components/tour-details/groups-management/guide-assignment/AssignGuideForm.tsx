
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
    
    // Debug the incoming guide data
    console.log("GUIDE DEBUG: Processing guides in AssignGuideForm:", 
      guides.map(g => ({ id: g.id, name: g.name, isValidUuid: isValidUuid(g.id) }))
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
        console.log(`Added special guide: ${guide.name} with ID: ${guide.id}`);
      }
    });
    
    // Look for guides with UUIDs that might be missing proper names
    guides.filter(g => isValidUuid(g.id) && (!g.name || g.name.includes('...'))).forEach(guide => {
      const dbMatch = allDatabaseGuides.find(dbGuide => dbGuide.id === guide.id);
      if (dbMatch && dbMatch.name) {
        // Add with the proper name from the database
        if (!processedGuideNames.has(dbMatch.name)) {
          uniqueGuides.push({
            id: dbMatch.id,
            name: dbMatch.name,
            info: dbMatch
          });
          processedGuideNames.add(dbMatch.name);
          console.log(`Found name for UUID guide: ${guide.id} -> ${dbMatch.name}`);
        }
      } else {
        // If still no match and not already added, add with UUID
        const displayId = `Guide (${guide.id.substring(0, 6)}...)`;
        if (!processedGuideNames.has(displayId)) {
          uniqueGuides.push({
            id: guide.id,
            name: displayId,
            info: guide.info
          });
          processedGuideNames.add(displayId);
          console.log(`Added UUID guide with no name match: ${guide.id}`);
        }
      }
    });
    
    // Handle the tour's primary guides
    if (tour) {
      if (tour.guide1 && !processedGuideNames.has(tour.guide1)) {
        const mainGuide1 = allDatabaseGuides.find(g => g.name === tour.guide1);
        if (mainGuide1) {
          uniqueGuides.push({
            id: mainGuide1.id,
            name: tour.guide1,
            info: mainGuide1
          });
        } else {
          uniqueGuides.push({
            id: "guide1",
            name: tour.guide1,
            info: null
          });
        }
        processedGuideNames.add(tour.guide1);
      }
      
      if (tour.guide2 && !processedGuideNames.has(tour.guide2)) {
        const mainGuide2 = allDatabaseGuides.find(g => g.name === tour.guide2);
        if (mainGuide2) {
          uniqueGuides.push({
            id: mainGuide2.id,
            name: tour.guide2,
            info: mainGuide2
          });
        } else {
          uniqueGuides.push({
            id: "guide2",
            name: tour.guide2,
            info: null
          });
        }
        processedGuideNames.add(tour.guide2);
      }
      
      if (tour.guide3 && !processedGuideNames.has(tour.guide3)) {
        const mainGuide3 = allDatabaseGuides.find(g => g.name === tour.guide3);
        if (mainGuide3) {
          uniqueGuides.push({
            id: mainGuide3.id,
            name: tour.guide3,
            info: mainGuide3
          });
        } else {
          uniqueGuides.push({
            id: "guide3",
            name: tour.guide3,
            info: null
          });
        }
        processedGuideNames.add(tour.guide3);
      }
    }
    
    // Sort guides by name for better UX
    uniqueGuides.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("GUIDE DEBUG: Final processed guides:", 
      uniqueGuides.map(g => ({ id: g.id, name: g.name }))
    );
    
    setProcessedGuides(uniqueGuides);
  }, [guides, allDatabaseGuides, tour]);
  
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
