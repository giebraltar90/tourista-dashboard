
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, RefreshCw, HelpCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

interface ErrorStateProps {
  message: string;
  tourId: string;
  onRetry?: () => void;
  error?: Error | any;
}

export const ErrorState = ({ message, tourId, onRetry, error }: ErrorStateProps) => {
  // Log detailed error information
  useEffect(() => {
    logger.error(`❌ Tour details error state activated for tour ${tourId}:`, {
      errorMessage: message,
      errorObject: error ? { 
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      timestamp: new Date().toISOString(),
      hasRetryFunction: !!onRetry
    });
  }, [message, tourId, onRetry, error]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tours" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tours
          </Link>
        </Button>
      </div>
      
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Tour</AlertTitle>
        <AlertDescription>
          {message || "There was an error loading the tour information. Please try again."}
        </AlertDescription>
      </Alert>
      
      <div className="p-8 bg-muted rounded-lg text-center space-y-4">
        <h2 className="text-xl font-medium">Unable to Load Tour Details</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          We couldn't load the tour with ID: {tourId || "Unknown"}
        </p>
        <p className="text-sm text-muted-foreground">
          This may be due to invalid data, connection issues, or the tour may no longer exist.
        </p>
        
        {error && (
          <Alert variant="warning" className="max-w-lg mx-auto bg-amber-50 text-amber-800 border-amber-200">
            <HelpCircle className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Error details:</strong> {error.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-center gap-4 mt-6">
          {onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link to="/tours" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Tour List
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
