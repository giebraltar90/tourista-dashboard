
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  tourId: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ tourId, onRetry }) => {
  return (
    <>
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load tour details (ID: {tourId}). Please try again.
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex justify-center">
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </>
  );
};
