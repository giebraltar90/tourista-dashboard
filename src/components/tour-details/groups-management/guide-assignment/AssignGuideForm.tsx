
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
import { Badge } from "@/components/ui/badge";
import { useGuideAssignmentForm } from "@/hooks/group-management/guide-assignment/useGuideAssignmentForm";
import { GuideOption } from "@/hooks/group-management/types";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/utils/logger";

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
  // Ensure we have valid guide options by deduplicating and cleaning up
  const normalizedGuides = React.useMemo(() => {
    // Create a map to deduplicate guides
    const guidesMap = new Map();
    
    guides.forEach(guide => {
      // Skip invalid guide objects
      if (!guide || !guide.id) return;
      
      // Use the ID as key to avoid duplicates
      if (!guidesMap.has(guide.id)) {
        guidesMap.set(guide.id, {
          ...guide,
          // Ensure guide has a valid name
          name: guide.name || `Guide (${guide.id.substring(0, 6)}...)`
        });
      }
    });
    
    // Convert map back to array
    return Array.from(guidesMap.values());
  }, [guides]);
  
  // Log available guides for debugging
  React.useEffect(() => {
    logger.debug("🔍 [AssignGuideForm] Available guides:", {
      tourId,
      groupIndex,
      currentGuideId,
      guidesCount: normalizedGuides.length,
      guides: normalizedGuides.map(g => ({ 
        id: g.id, 
        name: g.name, 
        type: g.info?.guideType 
      }))
    });
  }, [tourId, groupIndex, currentGuideId, normalizedGuides]);
  
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
    guides: normalizedGuides,
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
                  <SelectItem value="_none">None (Unassign Guide)</SelectItem>
                  {normalizedGuides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      <div className="flex items-center gap-2">
                        <span>{guide.name}</span>
                        {guide.info?.guideType && (
                          <Badge variant="outline" className="text-xs">
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
        
        {normalizedGuides.length === 0 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
            <AlertTriangle className="w-4 h-4" />
            <span>No available guides. Please create guides first.</span>
          </div>
        )}
      </form>
    </Form>
  );
};
