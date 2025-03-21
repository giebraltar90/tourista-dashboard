
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSetting, updateSetting } from "@/services/settingsService";
import { toast } from "@/components/ui/use-toast";
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
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "./LoadingSpinner";

// Form schema
const seoFormSchema = z.object({
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});

export type SEOFormValues = z.infer<typeof seoFormSchema>;

export function SEOSettings() {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const ogImage = await getSetting('ogImage');
      const favicon = await getSetting('favicon');
      return { ogImage, favicon };
    }
  });

  // Initialize form with default values
  const form = useForm<SEOFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      ogImage: settings?.ogImage || "",
      favicon: settings?.favicon || "",
    },
  });

  // Need to update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        ogImage: settings.ogImage || "",
        favicon: settings.favicon || ""
      });
      
      if (settings.ogImage) setOgImagePreview(settings.ogImage);
      if (settings.favicon) setFaviconPreview(settings.favicon);
    }
  }, [settings, form]);

  async function onSubmit(data: SEOFormValues) {
    try {
      let successCount = 0;

      // Save OG image to database
      if (data.ogImage) {
        const success = await updateSetting('ogImage', data.ogImage);
        if (success) successCount++;
      }

      // Save favicon to database
      if (data.favicon) {
        const success = await updateSetting('favicon', data.favicon);
        if (success) successCount++;
      }
      
      if (successCount > 0) {
        toast({
          title: "Settings updated",
          description: "Your SEO settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings to the database",
        variant: "destructive",
      });
    }
  }

  // Handle image file upload
  const handleFileChange = (field: 'ogImage' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (field === 'ogImage') {
          setOgImagePreview(base64String);
          form.setValue("ogImage", base64String);
        } else {
          setFaviconPreview(base64String);
          form.setValue("favicon", base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Sharing Settings</CardTitle>
        <CardDescription>
          Customize how your site appears when shared on social media and set your favicon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Preview Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="border p-2 rounded-md w-32 h-16 flex items-center justify-center bg-white">
                          {ogImagePreview ? (
                            <img
                              src={ogImagePreview}
                              alt="OG Image Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No image</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('ogImage', e)}
                            className="hidden"
                            id="og-image-upload"
                          />
                          <label htmlFor="og-image-upload">
                            <Button type="button" variant="outline" className="cursor-pointer" asChild>
                              <span><Upload className="mr-2 h-4 w-4" /> Upload image</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This image will be displayed when sharing your site on social media. Recommended size: 1200x630px.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="border p-2 rounded-md w-16 h-16 flex items-center justify-center bg-white">
                          {faviconPreview ? (
                            <img
                              src={faviconPreview}
                              alt="Favicon Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No icon</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/x-icon,image/png,image/svg+xml"
                            onChange={(e) => handleFileChange('favicon', e)}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label htmlFor="favicon-upload">
                            <Button type="button" variant="outline" className="cursor-pointer" asChild>
                              <span><Upload className="mr-2 h-4 w-4" /> Upload favicon</span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This icon will appear in browser tabs. Recommended format: ICO, PNG, or SVG (32x32px).
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
  );
}
