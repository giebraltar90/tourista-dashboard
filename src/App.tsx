
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ToursPage from "./pages/ToursPage";
import TourDetails from "./pages/TourDetails";
import TicketsPage from "./pages/TicketsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Tours routes */}
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/tours/:id" element={<TourDetails />} />
          
          {/* Tickets route */}
          <Route path="/tickets" element={<TicketsPage />} />
          
          {/* Settings route */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Future routes will be added here */}
          <Route path="/guides" element={<Index />} />
          <Route path="/locations" element={<Index />} />
          <Route path="/messages" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
