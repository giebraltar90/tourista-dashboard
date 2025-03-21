
import React, { useState, useEffect } from "react";
import { DEFAULT_LOGO, updateAppLogo } from "@/services/settingsService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { logoFormSchema, LogoFormValues } from "./types";
import { ImageUploadField } from "./ImageUploadField";

interface LogoFormProps {
  initialLogo: string;
}

export function LogoForm({ initialLogo }: LogoFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<LogoFormValues>({
    resolver: zodResolver(logoFormSchema),
    defaultValues: {
      logo: initialLogo || DEFAULT_LOGO,
    },
  });

  // Update form value when logoPreview changes
  useEffect(() => {
    if (logoPreview) {
      form.setValue("logo", logoPreview);
    }
  }, [logoPreview, form]);

  async function onSubmit(data: LogoFormValues) {
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

  const handleResetLogo = () => {
    setLogoPreview(null);
    form.setValue("logo", DEFAULT_LOGO);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ImageUploadField
          control={form.control}
          name="logo"
          label="Company Logo"
          description="Upload your company logo."
          imagePreview={logoPreview || form.getValues("logo")}
          setImagePreview={setLogoPreview}
          acceptTypes="image/*"
          recommendedSize="Recommended size: 200x50px."
          onResetClick={handleResetLogo}
          showResetButton={!!logoPreview}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  );
}
