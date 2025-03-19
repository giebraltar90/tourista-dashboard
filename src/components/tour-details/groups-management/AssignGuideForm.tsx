
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
  guideId: z.string().optional(),
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
  
  console.log("AssignGuideForm rendering with:", {
    tourId,
    groupIndex,
    guides: guides.length,
    currentGuideId
  });
  
  // Set the default value to "_none" if no guide is assigned
  const defaultGuideId = currentGuideId || "_none";
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideId: defaultGuideId,
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    // If no change, just close the dialog
    if (values.guideId === defaultGuideId) {
      onSuccess();
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Assigning guide:", { 
        groupIndex, 
        guideId: values.guideId,
        currentGuideId
      });
      
      // Call the assign guide function with the selected guide ID
      const success = await assignGuide(groupIndex, values.guideId);
      
      if (success) {
        toast.success("Guide assigned successfully");
        onSuccess();
      } else {
        toast.error("Failed to assign guide. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      // Always reset the submitting state, even if there's an error
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveGuide = async () => {
    try {
      setIsSubmitting(true);
      
      console.log("Removing guide from group:", { groupIndex });
      
      // Use "_none" as special value to remove the guide
      const success = await assignGuide(groupIndex, "_none");
      
      if (success) {
        toast.success("Guide removed successfully");
        onSuccess();
      } else {
        toast.error("Failed to remove guide. Please try again.");
      }
    } catch (error) {
      console.error("Error removing guide:", error);
      toast.error("Failed to remove guide");
    } finally {
      // Always reset the submitting state, even if there's an error
      setIsSubmitting(false);
    }
  };
  
  // Filter out any guides with empty ids to avoid the Select.Item error
  const validGuides = guides ? guides.filter(guide => guide && guide.id && guide.id.trim() !== "") : [];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="guideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Guide</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "_none"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a guide" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="_none">None (Unassigned)</SelectItem>
                  {validGuides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      <div className="flex items-center">
                        <span>{guide.name}</span>
                        {guide.info && guide.info.guideType && (
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
          {currentGuideId && currentGuideId !== "_none" && (
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || form.getValues().guideId === defaultGuideId}
            >
              {isSubmitting ? "Saving..." : "Assign Guide"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
