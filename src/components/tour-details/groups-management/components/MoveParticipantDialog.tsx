
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VentrataTourGroup } from "@/types/ventrata";

interface MoveParticipantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  participantName: string;
  fromGroupName: string;
  tourGroups: VentrataTourGroup[];
  onMoveToGroup: (toGroupIndex: number) => void;
  isLoading: boolean;
}

export const MoveParticipantDialog = ({
  isOpen,
  onOpenChange,
  participantName,
  fromGroupName,
  tourGroups,
  onMoveToGroup,
  isLoading
}: MoveParticipantDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Participant</DialogTitle>
          <DialogDescription>
            Move {participantName} from {fromGroupName} to another group
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Select a destination group:</p>
          
          <div className="space-y-2">
            {tourGroups.map((group, index) => (
              <Button
                key={group.id || index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onMoveToGroup(index)}
                disabled={isLoading || group.name === fromGroupName}
              >
                {group.name || `Group ${index + 1}`}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
