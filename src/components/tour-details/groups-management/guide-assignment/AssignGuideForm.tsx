
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
  // Check and filter guides to ensure only valid UUID guides are available
  const validGuides = guides.filter(guide => 
    guide.id === "_none" || isValidUuid(guide.id)
  );

  // Log validation results
  console.log("AssignGuideForm rendering with props:", {
    tourId,
    groupIndex,
    originalGuidesCount: guides.length,
    validGuidesCount: validGuides.length,
    currentGuideId,
    hasCurrentGuide: !!currentGuideId,
    currentGuideType: currentGuideId ? typeof currentGuideId : 'undefined',
    invalidGuides: guides.filter(g => g.id !== "_none" && !isValidUuid(g.id)).map(g => ({id: g.id, name: g.name}))
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
    guides: validGuides, // Only pass valid guides
    currentGuideId,
    onSuccess
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <GuideSelectField 
          form={form} 
          guides={validGuides} // Only use valid guides
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
