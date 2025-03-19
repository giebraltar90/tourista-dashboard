
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VentrataTourGroup } from "@/types/ventrata";
import { useUpdateGroup } from "@/hooks/group-management";
import { toast } from "sonner";

const formSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  entryTime: z.string().min(1, "Entry time is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditGroupFormProps {
  tourId: string;
  group: VentrataTourGroup;
  groupIndex: number;
  onSuccess: () => void;
}

export const EditGroupForm = ({ 
  tourId, 
  group, 
  groupIndex, 
  onSuccess 
}: EditGroupFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateGroup } = useUpdateGroup(tourId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: group.name,
      entryTime: group.entryTime,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      await updateGroup(groupIndex, {
        ...group,
        name: values.groupName,
        entryTime: values.entryTime,
      });
      
      toast.success("Group updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Group A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        
        <div className="flex justify-between pt-2">
          <Button type="button" variant="destructive" size="sm">
            Delete Group
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
