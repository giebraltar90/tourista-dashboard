
import { useState } from "react";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "@/hooks/group-management";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface GuideOption {
  id: string;
  name: string;
  info: GuideInfo | null;
}

const formSchema = z.object({
  guideId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignGuideFormProps {
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  onSuccess: () => void;
}

export const AssignGuideForm = ({ 
  tourId, 
  groupIndex, 
  guides, 
  currentGuideId, 
  onSuccess 
}: AssignGuideFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: currentGuideId || "",
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      await assignGuide(groupIndex, values.guideId);
      
      // Also update the group name based on the guide if it uses the default naming pattern
      const selectedGuide = guides.find(g => g.id === values.guideId);
      if (selectedGuide) {
        toast.success(`Guide ${selectedGuide.name} assigned successfully`);
      } else {
        toast.success("Guide assigned successfully");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveGuide = async () => {
    try {
      setIsSubmitting(true);
      
      await assignGuide(groupIndex, undefined);
      
      toast.success("Guide removed from group");
      onSuccess();
    } catch (error) {
      console.error("Error removing guide:", error);
      toast.error("Failed to remove guide");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="guideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Guide</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a guide" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {guides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      <div className="flex items-center">
                        <span>{guide.name}</span>
                        {guide.info && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {guide.info.guideType}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between pt-2">
          {currentGuideId && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleRemoveGuide}
              disabled={isSubmitting}
            >
              Remove Guide
            </Button>
          )}
          <div className="flex space-x-2 ml-auto">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Guide"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
