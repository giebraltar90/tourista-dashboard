
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DatabaseErrorAlertProps {
  error: string | undefined;
  isFixingDatabase: boolean;
  onFixDatabase: () => void;
}

export const DatabaseErrorAlert = ({ 
  error, 
  isFixingDatabase, 
  onFixDatabase 
}: DatabaseErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error.includes('JSON object requested') ? 'Database error: No tour data found' : `Database error: ${error}`}</span>
        <Button 
          onClick={onFixDatabase} 
          disabled={isFixingDatabase}
          size="sm" 
          variant="destructive"
        >
          {isFixingDatabase ? 'Fixing...' : 'Fix Database'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
