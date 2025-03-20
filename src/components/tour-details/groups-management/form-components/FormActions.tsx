
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onRemove?: () => void;
  hasCurrentGuide: boolean;
  hasChanges: boolean;
}

export const FormActions = ({ 
  isSubmitting, 
  onCancel, 
  onRemove, 
  hasCurrentGuide,
  hasChanges
}: FormActionsProps) => {
  return (
    <div className="flex justify-between pt-2">
      {hasCurrentGuide && onRemove && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onRemove}
          disabled={isSubmitting}
        >
          Remove Guide
        </Button>
      )}
      <div className="flex space-x-2 ml-auto">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? "Saving..." : "Assign Guide"}
        </Button>
      </div>
    </div>
  );
};
