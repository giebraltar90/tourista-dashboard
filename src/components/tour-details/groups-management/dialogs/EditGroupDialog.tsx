
import { VentrataTourGroup } from "@/types/ventrata";
import { DialogRoot } from "./DialogsRoot";
import { EditGroupForm } from "../EditGroupForm";

interface EditGroupDialogProps {
  tourId: string;
  group: VentrataTourGroup;
  groupIndex: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGroupDialog = ({ 
  tourId, 
  group, 
  groupIndex, 
  isOpen, 
  onOpenChange 
}: EditGroupDialogProps) => {
  return (
    <DialogRoot
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Group"
      description="Modify group details and assignment."
    >
      <EditGroupForm 
        tourId={tourId}
        group={group}
        groupIndex={groupIndex}
        onSuccess={() => onOpenChange(false)}
      />
    </DialogRoot>
  );
};
