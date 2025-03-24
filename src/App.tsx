
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ToursPage from "@/pages/ToursPage";
import TourDetailsPage from "@/pages/tour-details/TourDetailsPage";
import { RoleProvider } from "@/contexts/RoleContext";
import { DebugDisplay } from "@/components/debug/DebugDisplay";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <Alert variant="destructive" className="max-w-xl">
      <AlertTitle>Something went wrong!</AlertTitle>
      <AlertDescription>
        <div className="mt-2 text-sm whitespace-pre-wrap">{error.message}</div>
        <div className="mt-4">
          <Button onClick={resetErrorBoundary}>Try again</Button>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

function App() {
  return (
    <RoleProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Removed the nested Router here */}
        <Routes>
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/" element={<Navigate to="/tours" replace />} />
        </Routes>
        <Toaster />
        {process.env.NODE_ENV !== 'production' && <DebugDisplay />}
      </ErrorBoundary>
    </RoleProvider>
  );
}

export default App;
