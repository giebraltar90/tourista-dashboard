
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Index";
import AboutPage from "./pages/about";
import ToursPage from "./pages/ToursPage";
import TourDetails from "./pages/TourDetails";
import GuidesPage from "./pages/guides";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ensureDbFunctionsExist } from "@/services/api/initializeDbFunctions";
import { useEffect } from "react";

function App() {
  // Initialize DB functions on app startup
  useEffect(() => {
    console.log("Ensuring database functions exist");
    ensureDbFunctionsExist();
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/guides" element={<GuidesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
