
import React from "react";
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
import { useGuideAssignmentForm } from "@/hooks/group-management/guide-assignment/useGuideAssignmentForm";
import { GuideOption } from "@/hooks/group-management/types";
import { AlertTriangle } from "lucide-react";

interface AssignGuideFormProps {
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  onSuccess: () => void;
  tour?: any;
}

export const AssignGuideForm = ({ 
  tourId, 
  groupIndex, 
  guides, 
  currentGuideId, 
  onSuccess,
  tour
}: AssignGuideFormProps) => {
  const { 
    form, 
    isSubmitting, 
    handleSubmit, 
    handleRemoveGuide, 
    hasChanges, 
    hasCurrentGuide 
  } = useGuideAssignmentForm({
    tourId,
    groupIndex,
    guides,
    currentGuideId,
    onSuccess,
    tour
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="guideId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guide</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guide" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {guides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      {guide.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between items-center pt-4">
          {hasCurrentGuide && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleRemoveGuide}
              disabled={isSubmitting}
              className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Remove Guide
            </Button>
          )}
          
          <div className={`${hasCurrentGuide ? '' : 'ml-auto'} flex gap-2`}>
            <Button type="button" variant="ghost" onClick={onSuccess} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        
        {guides.length === 0 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
            <AlertTriangle className="w-4 h-4" />
            <span>No available guides. Please create guides first.</span>
          </div>
        )}
      </form>
    </Form>
  );
};
