
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "lucide-react";

interface GroupActionsProps {
  onAddGroup: () => void;
  onDeleteGroup: () => void;
  hasSelectedGroup: boolean;
  isHighSeason: boolean;
}

export const GroupActions = ({
  onAddGroup,
  onDeleteGroup,
  hasSelectedGroup,
  isHighSeason
}: GroupActionsProps) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="space-x-2">
        <Button 
          onClick={onAddGroup} 
          size="sm" 
          variant="outline"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>
      
      <div>
        {hasSelectedGroup && (
          <Button 
            onClick={onDeleteGroup}
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Group
          </Button>
        )}
      </div>
    </div>
  );
};
