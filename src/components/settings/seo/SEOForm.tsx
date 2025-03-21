
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSetting, updateSetting, DEFAULT_OG_IMAGE, DEFAULT_FAVICON } from "@/services/settingsService";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { seoFormSchema, SEOFormValues } from "./types";
import { ImageUploadField } from "./ImageUploadField";
import { useQuery } from "@tanstack/react-query";

export function SEOForm() {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      ogImage: "",
      favicon: "",
    },
  });

  // Need to update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        ogImage: settings.ogImage || DEFAULT_OG_IMAGE,
        favicon: settings.favicon || DEFAULT_FAVICON
      });
      
      if (settings.ogImage) setOgImagePreview(settings.ogImage);
      if (settings.favicon) setFaviconPreview(settings.favicon);
    }
  }, [settings, form]);

  // Update form values when previews change
  useEffect(() => {
    if (ogImagePreview) {
      form.setValue("ogImage", ogImagePreview);
    }
    if (faviconPreview) {
      form.setValue("favicon", faviconPreview);
    }
  }, [ogImagePreview, faviconPreview, form]);

  const handleResetOgImage = () => {
    setOgImagePreview(DEFAULT_OG_IMAGE);
    form.setValue("ogImage", DEFAULT_OG_IMAGE);
  };

  const handleResetFavicon = () => {
    setFaviconPreview(DEFAULT_FAVICON);
    form.setValue("favicon", DEFAULT_FAVICON);
  };

  async function onSubmit(data: SEOFormValues) {
    try {
      setIsSaving(true);
      let successCount = 0;

      // Save OG image to database
      if (data.ogImage) {
        console.log("Saving OG image");
        const success = await updateSetting('ogImage', data.ogImage);
        if (success) successCount++;
      }

      // Save favicon to database
      if (data.favicon) {
        console.log("Saving favicon");
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
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading settings...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ImageUploadField
          control={form.control}
          name="ogImage"
          label="Social Media Preview Image"
          description="This image will be displayed when sharing your site on social media."
          imagePreview={ogImagePreview}
          setImagePreview={setOgImagePreview}
          acceptTypes="image/*"
          recommendedSize="Recommended size: 1200x630px."
          onResetClick={handleResetOgImage}
          showResetButton={!!ogImagePreview && ogImagePreview !== DEFAULT_OG_IMAGE}
        />

        <ImageUploadField
          control={form.control}
          name="favicon"
          label="Favicon"
          description="This icon will appear in browser tabs."
          imagePreview={faviconPreview}
          setImagePreview={setFaviconPreview}
          acceptTypes="image/x-icon,image/png,image/svg+xml"
          recommendedSize="Recommended format: ICO, PNG, or SVG (32x32px)."
          onResetClick={handleResetFavicon}
          showResetButton={!!faviconPreview && faviconPreview !== DEFAULT_FAVICON}
        />

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
