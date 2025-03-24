
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Database Error</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2">
        <p>{error}</p>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onFixDatabase}
            disabled={isFixingDatabase}
          >
            {isFixingDatabase ? "Fixing..." : "Auto-fix Database"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
