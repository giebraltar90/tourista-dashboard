
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useState } from "react";
import { AddGroupForm } from "./AddGroupForm";
import { toast } from "sonner";

interface AddGroupButtonProps {
  tourId: string;
}

export const AddGroupButton = ({ tourId }: AddGroupButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Group</DialogTitle>
          <DialogDescription>
            Create a new group and assign a guide to it.
          </DialogDescription>
        </DialogHeader>
        <AddGroupForm 
          tourId={tourId} 
          onSuccess={() => {
            setIsOpen(false);
            toast.success("Group added successfully");
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
