
import { VentrataTourGroup } from "@/types/ventrata";
import { DialogRoot } from "./DialogsRoot";
import { AddGroupForm } from "../AddGroupForm";

interface AddGroupDialogProps {
  tourId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddGroupDialog = ({ 
  tourId, 
  isOpen, 
  onOpenChange 
}: AddGroupDialogProps) => {
  return (
    <DialogRoot
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add New Group"
      description="Create a new group and assign a guide to it."
    >
      <AddGroupForm 
        tourId={tourId} 
        onSuccess={() => onOpenChange(false)}
      />
    </DialogRoot>
  );
};
