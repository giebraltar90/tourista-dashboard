
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface RequestErrorProps {
  title: string;
  message: string;
  retryAction?: () => void;
}

export const RequestError = ({
  title,
  message,
  retryAction
}: RequestErrorProps) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">{message}</p>
        {retryAction && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={retryAction}
            className="mt-2 flex items-center gap-2"
          >
            <RefreshCcw className="h-3 w-3" /> Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
