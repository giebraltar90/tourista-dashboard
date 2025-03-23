
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onRemove?: () => void;
  hasCurrentGuide: boolean;
  hasChanges: boolean;
  children?: ReactNode;
}

export const FormActions = ({ 
  isSubmitting, 
  onCancel, 
  onRemove, 
  hasCurrentGuide,
  hasChanges,
  children
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
        {children ? (
          children
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
