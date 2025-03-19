
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface AddGroupButtonProps {
  onClick?: () => void;
}

export const AddGroupButton = ({ onClick }: AddGroupButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" onClick={onClick}>
          <PlusCircle className="h-4 w-4 mr-1" /> Add Group
        </Button>
      </DialogTrigger>
    </Dialog>
  );
};
