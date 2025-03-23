
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

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

  if (!dbCheckResult.hasTable) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          The participants table is missing from the database. {dbCheckResult.error && `Error: ${dbCheckResult.error}`}
        </AlertDescription>
      </Alert>
    );
  }

  if (dbCheckResult.participantCount === 0) {
    return (
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          The participants table exists but is empty. Try adding some test participants.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
      <AlertDescription>
        Database is ready with {dbCheckResult.participantCount} participants.
      </AlertDescription>
    </Alert>
  );
};
