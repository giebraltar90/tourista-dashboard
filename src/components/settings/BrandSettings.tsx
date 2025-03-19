
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoForm } from "./LogoForm";

interface BrandSettingsProps {
  logoUrl: string;
}

export function BrandSettings({ logoUrl }: BrandSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Settings</CardTitle>
        <CardDescription>
          Customize how your brand appears in the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogoForm initialLogo={logoUrl} />
      </CardContent>
    </Card>
  );
}
