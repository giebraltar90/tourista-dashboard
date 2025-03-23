
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatabaseStatusProps {
  dbCheckResult: {
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null;
}

export const DatabaseStatus = ({ dbCheckResult }: DatabaseStatusProps) => {
  if (!dbCheckResult) {
    return null;
  }
  
  // Show error if something went wrong
  if (dbCheckResult.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Database error: {dbCheckResult.error}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show warning if table doesn't exist
  if (!dbCheckResult.hasTable) {
    return (
      <Alert>
        <Database className="h-4 w-4 mr-2" />
        <AlertDescription className="flex justify-between items-center">
          <span>Participants table not found in database.</span>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show success if table exists and has participants
  if (dbCheckResult.participantCount > 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
        <AlertDescription>
          Database connected with {dbCheckResult.participantCount} participants.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show info if table exists but has no participants
  return (
    <Alert>
      <Database className="h-4 w-4 mr-2" />
      <AlertDescription>
        Database ready, but no participants found.
      </AlertDescription>
    </Alert>
  );
};
