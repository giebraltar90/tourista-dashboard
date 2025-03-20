
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onRemove: () => void;
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
    <div className="flex justify-between">
      <div>
        {hasCurrentGuide && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Remove Guide
          </Button>
        )}
      </div>
      <div className="flex gap-2">
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
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};
