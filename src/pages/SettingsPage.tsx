
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BrandSettings } from "@/components/settings/BrandSettings";
import { SEOSettings } from "@/components/settings/SEOSettings";
import { DebugSettings } from "@/components/settings/DebugSettings";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { LoadingSpinner } from "@/components/settings/LoadingSpinner";
import { useSeoSettings } from "@/hooks/useSeoSettings";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

export default function SettingsPage() {  
  // Load and apply SEO settings
  const { isLoading: seoLoading, error: seoError } = useSeoSettings();
  
  // Show error toast if SEO settings fail to load
  useEffect(() => {
    if (seoError) {
      toast({
        title: "Error loading SEO settings",
        description: seoError.message,
        variant: "destructive",
      });
    }
  }, [seoError]);

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <div className="space-y-8">
          <SettingsPageHeader />
          
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
            <BrandSettings />
            <SEOSettings />
            <DebugSettings />
          </div>
        </div>
      </DashboardLayout>
    </QueryClientProvider>
  );
}
