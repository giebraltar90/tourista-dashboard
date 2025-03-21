
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DatabaseStatusProps {
  dbCheckResult: {
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null;
}

export const DatabaseStatus = ({ dbCheckResult }: DatabaseStatusProps) => {
  if (!dbCheckResult) return null;
  
  if (!dbCheckResult.hasTable) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Participants table not found in database. Please check your database setup.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (dbCheckResult.hasTable && dbCheckResult.participantCount === 0) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Participants table exists but contains no records. You need to add participants to the database.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
