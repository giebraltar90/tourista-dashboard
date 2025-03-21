
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatabaseIcon, AlertTriangle } from "lucide-react";

interface DatabaseErrorAlertProps {
  error: string | null;
  isFixingDatabase: boolean;
  onFixDatabase: () => Promise<void>;
}

export const DatabaseErrorAlert = ({
  error,
  isFixingDatabase,
  onFixDatabase
}: DatabaseErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 flex justify-between items-center">
        <span>{error} Click "Fix Database" to attempt to resolve this issue.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onFixDatabase}
          disabled={isFixingDatabase}
          className="flex items-center text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100 ml-2"
        >
          <DatabaseIcon className={`h-4 w-4 mr-1 ${isFixingDatabase ? 'animate-spin' : ''}`} />
          {isFixingDatabase ? 'Fixing...' : 'Fix Database'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
