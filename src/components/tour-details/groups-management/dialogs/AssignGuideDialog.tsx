import { DialogRoot } from "./DialogsRoot";
import { AssignGuideForm } from "../guide-assignment";

interface AssignGuideDialogProps {
  tourId: string;
  groupIndex: number;
  guides: any[]; // Using any for brevity, should be properly typed
  currentGuideId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignGuideDialog = ({
  tourId,
  groupIndex,
  guides,
  currentGuideId,
  isOpen,
  onOpenChange
}: AssignGuideDialogProps) => {
  return (
    <DialogRoot
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Assign Guide"
      description="Choose a guide to assign to this group."
    >
      <AssignGuideForm 
        tourId={tourId}
        groupIndex={groupIndex}
        guides={guides}
        currentGuideId={currentGuideId}
        onSuccess={() => onOpenChange(false)}
      />
    </DialogRoot>
  );
};
