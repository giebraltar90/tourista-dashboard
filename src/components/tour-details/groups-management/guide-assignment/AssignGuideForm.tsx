
import { Form } from "@/components/ui/form";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectField } from "./GuideSelectField";
import { FormActions } from "./FormActions";
import { useGuideAssignmentForm } from "@/hooks/group-management/useGuideAssignmentForm";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
  // Filter out duplicate guides by name, prioritizing valid UUID guides
  const uniqueGuides: GuideOption[] = [];
  const processedGuideNames = new Set<string>();
  
  // First process guides with valid UUIDs
  guides
    .filter(guide => isValidUuid(guide.id))
    .forEach(guide => {
      if (!processedGuideNames.has(guide.name)) {
        uniqueGuides.push(guide);
        processedGuideNames.add(guide.name);
      }
    });
  
  // Log unique guides count
  console.log("AssignGuideForm rendering with filtered guides:", {
    tourId,
    groupIndex,
    originalGuidesCount: guides.length,
    uniqueGuidesCount: uniqueGuides.length,
    currentGuideId,
    hasCurrentGuide: !!currentGuideId,
    currentGuideType: currentGuideId ? typeof currentGuideId : 'undefined'
  });
  
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
    guides: uniqueGuides, // Only pass unique guides with valid UUIDs
    currentGuideId,
    onSuccess
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <GuideSelectField 
          form={form} 
          guides={uniqueGuides} // Only use unique guides
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
