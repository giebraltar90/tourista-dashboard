
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { X } from "lucide-react";
import { TicketBucketFormValues } from "@/types/ticketBuckets";
import { createTicketBucket } from "@/services/api/ticketBucketService";
import { toast } from "sonner";
import { BucketFormFields } from "./BucketFormFields";

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

  // Watch bucket type for conditional rendering
  const watchBucketType = form.watch("bucket_type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Explicitly cast the values to TicketBucketFormValues to ensure type safety
      const bucketData: TicketBucketFormValues = {
        reference_number: values.reference_number,
        bucket_type: values.bucket_type,
        tickets_range: values.tickets_range,
        max_tickets: values.max_tickets,
        date: values.date,
        access_time: values.access_time
      };
      
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
        
        <BucketFormFields form={form} watchBucketType={watchBucketType} />
        
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
