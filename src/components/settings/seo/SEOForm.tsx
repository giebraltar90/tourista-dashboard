
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSetting, DEFAULT_OG_IMAGE, DEFAULT_FAVICON } from "@/services/settingsService";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { seoFormSchema, SEOFormValues } from "./types";
import { ImageUploadField } from "./ImageUploadField";
import { useQuery } from "@tanstack/react-query";
import { useSeoSettings } from "@/hooks/useSeoSettings";

export function SEOForm() {
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use our enhanced hook
  const { 
    ogImage: initialOgImage, 
    favicon: initialFavicon, 
    isLoading,
    updateMetaTags 
  } = useSeoSettings();

  // Initialize form with default values
  const form = useForm<SEOFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      ogImage: "",
      favicon: "",
    },
  });

  // Update form values when initial settings are loaded
  useEffect(() => {
    if (!isLoading) {
      form.reset({
        ogImage: initialOgImage || DEFAULT_OG_IMAGE,
        favicon: initialFavicon || DEFAULT_FAVICON
      });
      
      if (initialOgImage) setOgImagePreview(initialOgImage);
      if (initialFavicon) setFaviconPreview(initialFavicon);
      
      console.log("Initial SEO settings loaded into form:", {
        ogImage: initialOgImage || DEFAULT_OG_IMAGE,
        favicon: initialFavicon || DEFAULT_FAVICON
      });
    }
  }, [initialOgImage, initialFavicon, isLoading, form]);

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
      console.log("Submitting SEO form with data:", data);
      setIsSaving(true);
      let successCount = 0;

      // Save OG image to database
      if (data.ogImage) {
        console.log("Saving OG image:", data.ogImage.substring(0, 50) + "...");
        const success = await updateSetting('ogImage', data.ogImage);
        if (success) {
          console.log("Successfully saved OG image to database");
          successCount++;
        }
      }

      // Save favicon to database
      if (data.favicon) {
        console.log("Saving favicon:", data.favicon.substring(0, 50) + "...");
        const success = await updateSetting('favicon', data.favicon);
        if (success) {
          console.log("Successfully saved favicon to database");
          successCount++;
        }
      }
      
      if (successCount > 0) {
        // Force an immediate update of meta tags after successful save
        console.log("Updating meta tags after successful save");
        updateMetaTags(data.ogImage, data.favicon);
        
        // Trigger a refresh to make sure social media previews will pick up the changes
        const currentUrl = window.location.href;
        window.history.replaceState(null, '', currentUrl);
        
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
