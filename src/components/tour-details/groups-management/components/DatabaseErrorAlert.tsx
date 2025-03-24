
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DatabaseErrorAlertProps {
  error: string | null;
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
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Database Error</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <p>{error}</p>
        <div>
          <Button 
            variant="secondary"
            size="sm"
            onClick={onFixDatabase}
            disabled={isFixingDatabase}
          >
            {isFixingDatabase && (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isFixingDatabase ? "Fixing..." : "Fix Database Issues"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
