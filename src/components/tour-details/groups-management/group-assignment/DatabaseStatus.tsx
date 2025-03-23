
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatabaseCheckResult } from "./hooks/useDatabaseData";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface DatabaseStatusProps {
  dbCheckResult: DatabaseCheckResult | null;
}

export const DatabaseStatus = ({ dbCheckResult }: DatabaseStatusProps) => {
  if (!dbCheckResult) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Checking Database</AlertTitle>
        <AlertDescription>
          Checking database tables and content...
        </AlertDescription>
      </Alert>
    );
  }

  if (dbCheckResult.error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>
          {dbCheckResult.error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dbCheckResult.tablesExist) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Missing Database Tables</AlertTitle>
        <AlertDescription>
          Some required database tables are missing. 
          Try running the setup script.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertTitle>Database Status</AlertTitle>
      <AlertDescription>
        <div className="grid grid-cols-2 text-sm">
          <span>Tours:</span>
          <span className="font-medium">{dbCheckResult.toursCount || 0}</span>
          
          <span>Tour Groups:</span>
          <span className="font-medium">{dbCheckResult.tourGroupsCount || 0}</span>
          
          <span>Participants:</span>
          <span className="font-medium">{dbCheckResult.participantsCount || 0}</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};
