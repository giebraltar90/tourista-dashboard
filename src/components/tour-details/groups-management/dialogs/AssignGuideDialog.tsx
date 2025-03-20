
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AssignGuideForm } from "../guide-assignment/AssignGuideForm";
import { GuideInfo } from "@/types/ventrata";

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
  guides, 
  currentGuideId 
}: AssignGuideDialogProps) => {
  console.log('AssignGuideDialog rendering with props:', {
    tourId,
    groupIndex,
    guidesCount: guides.length,
    currentGuideId
  });

  const handleSuccess = () => {
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
          guides={guides}
          currentGuideId={currentGuideId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
