
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface BucketTypeFieldProps {
  form: UseFormReturn<any>;
  onTypeChange: (value: string) => void;
}

export function BucketTypeField({ form, onTypeChange }: BucketTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="bucket_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bucket Type</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onTypeChange(value);
            }} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select bucket type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="petit">Petit (3-10 tickets)</SelectItem>
              <SelectItem value="grande">Grande (11-30 tickets)</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Bucket type determines the range of tickets
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
