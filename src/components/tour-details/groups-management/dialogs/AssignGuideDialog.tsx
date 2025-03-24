
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useGuideAssignmentForm } from "@/hooks/group-management/guide-assignment/useGuideAssignmentForm";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { EventEmitter } from "@/utils/eventEmitter";

interface GuideOption {
  id: string;
  name: string;
  info: any;
}

interface AssignGuideDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
  groupIndex: number;
  guides: GuideOption[];
  currentGuideId?: string;
  tour?: any; // Optional tour data
}

export const AssignGuideDialog = ({
  isOpen,
  onOpenChange,
  tourId,
  groupIndex,
  guides,
  currentGuideId,
  tour
}: AssignGuideDialogProps) => {
  const { assignGuide } = useAssignGuide(tourId);
  
  // Get the form and its handlers
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
    onSuccess: () => {
      onOpenChange(false);
      
      // Emit an event to refresh guide assignments
      EventEmitter.emit(`guide-change:${tourId}`);
    },
    tour
  });
  
  // Get the selected guide's info
  const selectedGuideId = form.watch("guideId");
  const selectedGuide = guides.find(g => g.id === selectedGuideId);
  const guideHasInfo = selectedGuide && selectedGuide.info;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Guide to Group {groupIndex + 1}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="guideId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Guide</FormLabel>
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
                      <SelectItem value="_none">None (Unassigned)</SelectItem>
                      {guides.map((guide) => (
                        <SelectItem key={guide.id} value={guide.id}>
                          {guide.name} {guide.info?.guideType ? `(${guide.info.guideType})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {guideHasInfo && selectedGuide.info.guideType && (
              <Alert variant="info" className="bg-blue-50">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription>
                  <div className="font-medium mb-1">Guide Type: {selectedGuide.info.guideType}</div>
                  {selectedGuide.info.guideType === "GA Ticket" && (
                    <div className="text-sm text-muted-foreground">
                      GA Ticket guide requires an adult ticket. Cannot guide inside.
                    </div>
                  )}
                  {selectedGuide.info.guideType === "GA Free" && (
                    <div className="text-sm text-muted-foreground">
                      GA Free guide requires a child ticket (under 26). Cannot guide inside.
                    </div>
                  )}
                  {selectedGuide.info.guideType === "GC" && (
                    <div className="text-sm text-muted-foreground">
                      GC guide can guide inside. No ticket required.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              {hasCurrentGuide && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="mr-auto"
                  onClick={handleRemoveGuide}
                  disabled={isSubmitting}
                >
                  Remove Guide
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={!hasChanges || isSubmitting}
              >
                {isSubmitting ? "Assigning..." : "Assign Guide"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
