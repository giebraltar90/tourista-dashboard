import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TicketBucketFormValues } from "@/types/ticketBuckets";
import { createTicketBucket } from "@/services/api/ticketBucketService";
import { toast } from "sonner";

const formSchema = z.object({
  reference_number: z.string().min(1, "Reference number is required"),
  bucket_type: z.enum(["petit", "grande"]),
  tickets_range: z.string().min(1, "Tickets range is required"),
  max_tickets: z.number().int().positive("Max tickets must be a positive number"),
  date: z.date({
    required_error: "Date is required",
  }),
  access_time: z.string().min(1, "Access time is required"),
});

interface CreateTicketBucketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateTicketBucketForm({ onSuccess, onCancel }: CreateTicketBucketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reference_number: "",
      bucket_type: "petit",
      tickets_range: "3-10",
      max_tickets: 10,
      access_time: "",
    },
  });

  // Update max tickets and tickets range when bucket type changes
  const watchBucketType = form.watch("bucket_type");
  
  if (watchBucketType === "petit" && form.getValues("max_tickets") > 10) {
    form.setValue("max_tickets", 10);
    form.setValue("tickets_range", "3-10");
  } else if (watchBucketType === "grande" && (form.getValues("max_tickets") < 11 || form.getValues("max_tickets") > 30)) {
    form.setValue("max_tickets", 30);
    form.setValue("tickets_range", "11-30");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const bucketData: TicketBucketFormValues = values;
      
      await createTicketBucket(bucketData);
      toast.success("Ticket bucket created successfully");
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
    } catch (error) {
      console.error("Error creating ticket bucket:", error);
      toast.error("Failed to create ticket bucket");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Create Ticket Bucket</h3>
          {onCancel && (
            <Button type="button" variant="outline" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
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
          
          <FormField
            control={form.control}
            name="bucket_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bucket Type</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "petit") {
                      form.setValue("tickets_range", "3-10");
                      form.setValue("max_tickets", 10);
                    } else {
                      form.setValue("tickets_range", "11-30");
                      form.setValue("max_tickets", 30);
                    }
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
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date for which this ticket bucket is valid
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket Bucket"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
