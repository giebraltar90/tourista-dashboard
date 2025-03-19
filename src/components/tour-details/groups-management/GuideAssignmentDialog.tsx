
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { AssignGuideForm } from "./AssignGuideForm";

interface GuideAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroupIndex: number | null;
  tourId: string;
  tourGroups: any[];
  validGuides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
}

export const GuideAssignmentDialog = ({
  isOpen,
  onOpenChange,
  selectedGroupIndex,
  tourId,
  tourGroups,
  validGuides
}: GuideAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Guide to Group</DialogTitle>
          <DialogDescription>
            Choose a guide to assign to this group
          </DialogDescription>
        </DialogHeader>
        {selectedGroupIndex !== null && tourGroups[selectedGroupIndex] && (
          <AssignGuideForm 
            tourId={tourId}
            groupIndex={selectedGroupIndex}
            guides={validGuides}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
