
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export interface ErrorStateProps {
  message?: string;
  tourId?: string;
  onRetry: () => void;
  error?: Error | unknown;
}

export const ErrorState = ({ message, tourId, onRetry, error }: ErrorStateProps) => {
  const errorMessage = message || 
    (error instanceof Error ? error.message : "Failed to load tour details");

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-muted/40 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Unable to Load Tour</h2>
      <p className="text-muted-foreground mb-4 text-center">
        {errorMessage}
        {tourId && <span className="block text-sm mt-1">Tour ID: {tourId}</span>}
      </p>
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
};
