
import { useState, useEffect } from "react";
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
import { getAppLogo, updateAppLogo } from "@/services/settingsService";

// Default logo path that's used as a fallback
const DEFAULT_LOGO = "/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png";

// Form schema
const settingsFormSchema = z.object({
  logo: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form with default values
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      logo: DEFAULT_LOGO,
    },
  });

  // Load settings from the database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const logoUrl = await getAppLogo();
        form.setValue("logo", logoUrl);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings from the database",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      // Save logo to database
      if (data.logo) {
        const success = await updateAppLogo(data.logo);
        
        if (success) {
          toast({
            title: "Settings updated",
            description: "Your logo has been updated successfully.",
          });
        } else {
          throw new Error("Failed to update logo");
        }
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings to the database",
        variant: "destructive",
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

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
