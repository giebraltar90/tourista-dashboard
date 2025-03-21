
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoForm } from "./brand/LogoForm";
import { LoadingSpinner } from "./LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { getAppLogo } from "@/services/settingsService";

export function BrandSettings() {
  const { data: logo, isLoading } = useQuery({
    queryKey: ['logo-settings'],
    queryFn: async () => {
      const logoUrl = await getAppLogo();
      return logoUrl;
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Settings</CardTitle>
        <CardDescription>
          Customize how your brand appears in the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogoForm initialLogo={logo || ""} />
      </CardContent>
    </Card>
  );
}
