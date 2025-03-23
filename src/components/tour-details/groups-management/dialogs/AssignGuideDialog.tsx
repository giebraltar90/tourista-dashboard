import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AssignGuideForm } from "../guide-assignment/AssignGuideForm";
import { GuideInfo } from "@/types/ventrata";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

interface AssignGuideDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info: GuideInfo | null;
  }>;
  currentGuideId?: string;
}

export const AssignGuideDialog = ({ 
  isOpen, 
  onOpenChange, 
  tourId, 
  groupIndex, 
  guides: inputGuides, 
  currentGuideId 
}: AssignGuideDialogProps) => {
  // Process guide data to ensure readable names
  const [processedGuides, setProcessedGuides] = useState(inputGuides);
  
  useEffect(() => {
    // Ensure all guides have readable names
    const processedGuidesList = inputGuides.map(guide => {
      // If guide has a UUID as name or name with "..." in it, give it a better name
      if (!guide.name || guide.name.includes('...') || guide.name === guide.id) {
        return {
          ...guide,
          name: guide.info?.name || `Guide (ID: ${guide.id.substring(0, 8)})`
        };
      }
      return guide;
    });
    
    // Filter out duplicates by ID (keep the first occurrence)
    const uniqueGuides = processedGuidesList.filter((guide, index, self) => 
      index === self.findIndex(g => g.id === guide.id)
    );
    
    logger.debug('🔍 [AssignGuideDialog] Processing guides:', {
      tourId,
      groupIndex,
      guidesCount: uniqueGuides.length,
      currentGuideId,
      guides: uniqueGuides.map(g => ({ id: g.id, name: g.name, type: g.info?.guideType }))
    });
    
    setProcessedGuides(uniqueGuides);
  }, [inputGuides, tourId, groupIndex, currentGuideId]);

  const handleSuccess = () => {
    toast.success("Guide assignment updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Guide to Group {groupIndex + 1}</DialogTitle>
          <DialogDescription>
            Select a guide to assign to this group or remove the current guide.
          </DialogDescription>
        </DialogHeader>
        
        <AssignGuideForm
          tourId={tourId}
          groupIndex={groupIndex}
          guides={processedGuides}
          currentGuideId={currentGuideId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
