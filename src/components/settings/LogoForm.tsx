
import { useState } from "react";
import { DEFAULT_LOGO } from "@/services/settingsService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { updateAppLogo } from "@/services/settingsService";
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

// Form schema
const logoFormSchema = z.object({
  logo: z.string().optional(),
});

export type LogoFormValues = z.infer<typeof logoFormSchema>;

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
  );
}
