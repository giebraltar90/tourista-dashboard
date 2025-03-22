
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { BucketTypeField } from "./BucketTypeField";
import { BucketDateField } from "./BucketDateField";

interface BucketFormFieldsProps {
  form: UseFormReturn<any>;
  watchBucketType: string;
}

export function BucketFormFields({ form, watchBucketType }: BucketFormFieldsProps) {
  const handleBucketTypeChange = (value: string) => {
    if (value === "petit") {
      form.setValue("tickets_range", "3-10");
      form.setValue("max_tickets", 10);
    } else {
      form.setValue("tickets_range", "11-30");
      form.setValue("max_tickets", 30);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="reference_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter reference number" {...field} />
            </FormControl>
            <FormDescription>
              The Versailles chateau reference number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <BucketTypeField 
        form={form} 
        onTypeChange={handleBucketTypeChange} 
      />
      
      <FormField
        control={form.control}
        name="tickets_range"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tickets Range</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., 3-10 or 11-30"
                {...field}
                readOnly
              />
            </FormControl>
            <FormDescription>
              The range of tickets this bucket can hold
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="max_tickets"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Tickets</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter maximum tickets" 
                {...field}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  field.onChange(isNaN(value) ? 0 : value);
                }}
                value={field.value}
              />
            </FormControl>
            <FormDescription>
              {watchBucketType === "petit" 
                ? "Maximum 10 tickets for petit buckets" 
                : "Maximum 30 tickets for grande buckets"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <BucketDateField form={form} />
      
      <FormField
        control={form.control}
        name="access_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Access Time</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 09:00 AM" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              The time at which the bucket allows access to the chateau
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
