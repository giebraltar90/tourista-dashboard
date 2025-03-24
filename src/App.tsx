
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Index";
import AboutPage from "./pages/about";
import ToursPage from "./pages/ToursPage";
import TourDetailsPage from "./pages/tour-details/TourDetailsPage";
import GuidesPage from "./pages/guides";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import TicketsPage from "./pages/TicketsPage";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ensureDbFunctionsExist } from "@/services/api/initializeDbFunctions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoleProvider } from "@/contexts/RoleContext";

// Create a query client instance
const queryClient = new QueryClient();

// Execute DB functions initialization outside of component
console.log("Ensuring database functions exist");
ensureDbFunctionsExist().catch(error => {
  console.error("Failed to initialize DB functions:", error);
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:id" element={<TourDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </ThemeProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
