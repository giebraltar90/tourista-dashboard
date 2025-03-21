
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLogoSettings } from "@/hooks/useSettings";
import { BrandSettings } from "@/components/settings/BrandSettings";
import { SEOSettings } from "@/components/settings/SEOSettings";
import { DebugSettings } from "@/components/settings/DebugSettings";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { LoadingSpinner } from "@/components/settings/LoadingSpinner";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function SettingsPage() {
  const { logo, isLoading, error } = useLogoSettings();
  
  // Show error toast if loading fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load settings from the database",
        variant: "destructive",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SettingsPageHeader />
        
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
          <BrandSettings logoUrl={logo} />
          <SEOSettings />
          <DebugSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
