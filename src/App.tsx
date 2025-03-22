
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { RoleProvider } from "./contexts/RoleContext";
import { DebugProvider } from "./contexts/DebugContext";
import { useEffect } from "react";
import { useSeoSettings } from "./hooks/useSeoSettings";
import Index from "./pages/Index";
import ToursPage from "./pages/ToursPage";
import TourDetails from "./pages/TourDetails";
import TicketsPage from "./pages/TicketsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import GuideDashboard from "./pages/guide/GuideDashboard";
import GuideProfile from "./pages/guide/GuideProfile";
import GuideMessages from "./pages/guide/GuideMessages";

// Create query client with error logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// SEO handler component to update meta tags on route changes
function SEOHandler() {
  const location = useLocation();
  const { updateMetaTags, ogImage, favicon } = useSeoSettings();
  
  useEffect(() => {
    console.log("Route changed, updating SEO settings");
    if (ogImage && favicon) {
      updateMetaTags(ogImage, favicon);
    }
  }, [location.pathname, ogImage, favicon, updateMetaTags]);
  
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <DebugProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SEOHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Tours routes */}
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/tours/:id" element={<TourDetails />} />
              
              {/* Tickets route */}
              <Route path="/tickets" element={<TicketsPage />} />
              
              {/* Settings route */}
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Guide routes */}
              <Route path="/guide" element={<GuideDashboard />} />
              <Route path="/guide/profile" element={<GuideProfile />} />
              <Route path="/guide/messages" element={<GuideMessages />} />
              
              {/* Future routes will be added here */}
              <Route path="/guides" element={<Index />} />
              <Route path="/locations" element={<Index />} />
              <Route path="/messages" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DebugProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
