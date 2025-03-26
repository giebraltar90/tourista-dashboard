
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage";
import TourDetailsPage from "./pages/tour-details/TourDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { Toaster } from "./components/ui/sonner";
import GuideLogin from "./components/admin/GuideLogin";
import { RoleProvider } from "./contexts/RoleContext";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { logger } from "./utils/logger";
import { testSupabaseConnection } from "./integrations/supabase/client";

// Test Supabase connection on app load
logger.setDebugMode(true);
testSupabaseConnection()
  .then(result => {
    if (result.success) {
      logger.debug("✅ Initial Supabase connection test successful");
    } else {
      logger.error("❌ Initial Supabase connection test failed:", result.error);
    }
  })
  .catch(err => {
    logger.error("❌ Exception during initial Supabase connection test:", err);
  });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tour/:id" element={<TourDetailsPage />} />
            <Route path="/guide" element={<GuideLogin />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
        <Toaster position="top-right" closeButton />
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
