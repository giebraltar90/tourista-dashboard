
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { logger } from "@/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console
    logger.error("Error caught by boundary:", error);
    logger.error("Component stack:", errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    // Reset the error boundary and try rendering the children again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error UI
      return this.props.fallback || (
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || "An unexpected error occurred"}
            </AlertDescription>
          </Alert>
          
          {this.state.errorInfo && (
            <div className="mb-4 p-4 bg-muted rounded-md overflow-auto max-h-48">
              <pre className="text-sm">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="outline">
              Try Again
            </Button>
            <Button onClick={this.handleReload}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
