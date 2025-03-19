
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLogoSettings } from "@/hooks/useSettings";
import { BrandSettings } from "@/components/settings/BrandSettings";
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
      <div className="space-y-6">
        <SettingsPageHeader />
        <BrandSettings logoUrl={logo} />
      </div>
    </DashboardLayout>
  );
}
