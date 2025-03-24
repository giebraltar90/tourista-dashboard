
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ToursPage from "@/pages/ToursPage";
import TourDetailsPage from "@/pages/tour-details/TourDetailsPage";
import { RoleProvider } from "@/contexts/RoleContext";

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetailsPage />} />
          <Route path="/" element={<Navigate to="/tours" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </RoleProvider>
  );
}

export default App;
