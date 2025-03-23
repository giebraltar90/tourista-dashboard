
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        {children}
      </div>
      
      {hasCurrentGuide && onRemove && (
        <Button 
          type="button" 
          variant="destructive" 
          size="sm" 
          onClick={onRemove}
          disabled={isSubmitting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Guide
        </Button>
      )}
    </div>
  );
};
