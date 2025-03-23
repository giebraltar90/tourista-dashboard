
import { useState } from "react";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGuideData } from "@/hooks/useGuideData";
import { useAddGroup } from "@/hooks/group-management";
import { toast } from "sonner";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";

const formSchema = z.object({
  entryTime: z.string().min(1, "Entry time is required"),
  guideId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddGroupFormProps {
  tourId: string;
  onSuccess: () => void;
}

export const AddGroupForm = ({ tourId, onSuccess }: AddGroupFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guides } = useGuideData();
  
  // Get the addGroup function
  const { addGroup } = useAddGroup(tourId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryTime: "",
      guideId: "",
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const groupData = {
        entryTime: values.entryTime,
        guideId: values.guideId || undefined,
      };
      
      console.log("Submitting new group:", groupData);
      
      await addGroup();
      
      form.reset();
      onSuccess();
      toast.success("Group added successfully");
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to add group");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter guides to only include those with valid IDs to prevent SelectItem errors
  const validGuides = Array.isArray(guides) 
    ? guides.filter((guide: GuideInfo) => guide && guide.id && guide.id.trim() !== "") 
    : [];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="entryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 09:30" {...field} />
              </FormControl>
              <FormDescription>
                Time when this group should enter the venue
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="guideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Guide (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guide" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None (Unassigned)</SelectItem>
                  {validGuides.map((guide: GuideInfo) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      {guide.name} ({guide.guideType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
