
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Control } from "react-hook-form";
import { LogoFormValues } from "./types";

interface ImageUploadFieldProps {
  control: Control<LogoFormValues>;
  name: "logo";
  label: string;
  description: string;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  acceptTypes: string;
  recommendedSize: string;
  onResetClick?: () => void;
  showResetButton?: boolean;
}

export function ImageUploadField({
  control,
  name,
  label,
  description,
  imagePreview,
  setImagePreview,
  acceptTypes,
  recommendedSize,
  onResetClick,
  showResetButton = false,
}: ImageUploadFieldProps) {
  // Handle image file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="border p-2 rounded-md w-16 h-16 flex items-center justify-center bg-white">
                  <img
                    src={imagePreview || field.value}
                    alt="Logo Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept={acceptTypes}
                    onChange={(e) => {
                      handleFileChange(e);
                      const base64 = e.target.files?.[0] 
                        ? URL.createObjectURL(e.target.files[0]) 
                        : '';
                      field.onChange(imagePreview);
                    }}
                    className="hidden"
                    id={`${name}-upload`}
                  />
                  <label htmlFor={`${name}-upload`}>
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span><Upload className="mr-2 h-4 w-4" /> Upload new logo</span>
                    </Button>
                  </label>
                </div>
              </div>
              {showResetButton && onResetClick && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onResetClick}
                >
                  Reset to default
                </Button>
              )}
            </div>
          </FormControl>
          <FormDescription>
            {description} {recommendedSize}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
