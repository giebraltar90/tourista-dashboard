
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import NewTourPage from "./pages/NewTourPage";
import TourDetails from "./pages/TourDetails";
import EditTourPage from "./pages/EditTourPage";
import TicketBucketsPage from "./pages/TicketBucketsPage";
import GuideDashboard from "./pages/guide/GuideDashboard";
import GuideMessages from "./pages/guide/GuideMessages";
import GuideProfile from "./pages/guide/GuideProfile";
import ToursPage from "./pages/ToursPage";
import { initializeDatabaseFunctions } from "./services/api/db/initialize";
import { logger } from "./utils/logger";
import { RoleProvider } from "./contexts/RoleContext";

function App() {
  // Initialize database functions on app start
  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabaseFunctions();
      } catch (error) {
        logger.error("Failed to initialize database functions:", error);
      }
    };
    
    initDb();
  }, []);

  return (
    <RoleProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/new" element={<NewTourPage />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/tours/:id/edit" element={<EditTourPage />} />
        <Route path="/ticket-buckets" element={<TicketBucketsPage />} />
        
        {/* Guide routes */}
        <Route path="/guide" element={<GuideDashboard />} />
        <Route path="/guide/messages" element={<GuideMessages />} />
        <Route path="/guide/profile" element={<GuideProfile />} />
      </Routes>
    </RoleProvider>
  );
}

export default App;
