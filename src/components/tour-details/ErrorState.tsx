
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  message: string;
  tourId: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, tourId, onRetry }: ErrorStateProps) => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tours" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tours
          </Link>
        </Button>
      </div>
      
      <div className="p-8 bg-muted rounded-lg text-center space-y-4">
        <h2 className="text-xl font-medium">Error Loading Tour</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {message || "There was an error loading the tour information. Please try again."}
        </p>
        <p className="text-sm text-muted-foreground">Tour ID: {tourId || "Unknown"}</p>
        
        {onRetry && (
          <Button onClick={onRetry} className="mt-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
