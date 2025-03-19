
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

// Default logo path that's currently used in the system
const DEFAULT_LOGO = "/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png";

// Form schema
const settingsFormSchema = z.object({
  logo: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Get stored logo from localStorage or use default
  const savedLogo = localStorage.getItem("appLogo") || DEFAULT_LOGO;
  
  // Initialize form with values from localStorage
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      logo: savedLogo,
    },
  });

  function onSubmit(data: SettingsFormValues) {
    // Save logo to localStorage
    if (data.logo) {
      localStorage.setItem("appLogo", data.logo);
      toast({
        title: "Settings updated",
        description: "Your logo has been updated successfully.",
      });
    }
  }

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        form.setValue("logo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application settings and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Settings</CardTitle>
            <CardDescription>
              Customize how your brand appears in the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="border p-2 rounded-md w-16 h-16 flex items-center justify-center bg-white">
                              <img
                                src={logoPreview || field.value}
                                alt="Logo Preview"
                                className="max-w-full max-h-full"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label htmlFor="logo-upload">
                                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                                  <span><Upload className="mr-2 h-4 w-4" /> Upload new logo</span>
                                </Button>
                              </label>
                            </div>
                          </div>
                          {logoPreview && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => {
                                setLogoPreview(null);
                                form.setValue("logo", DEFAULT_LOGO);
                              }}
                            >
                              Reset to default
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload your company logo. Recommended size: 200x50px.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
