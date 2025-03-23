
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { ReactNode } from "react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onRemove?: () => void;
  hasCurrentGuide?: boolean;
  hasChanges?: boolean;
  children?: ReactNode;
}

export const FormActions = ({
  isSubmitting,
  onCancel,
  onRemove,
  hasCurrentGuide = false,
  hasChanges = false,
  children
}: FormActionsProps) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div>
        {hasCurrentGuide && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={isSubmitting}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        {children}
        
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};
