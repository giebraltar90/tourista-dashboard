
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { Loader2 } from "lucide-react";

interface MoveParticipantSheetProps {
  selectedParticipant: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  };
  tourGroups: VentrataTourGroup[];
  onClose: () => void;
  onMove: (toGroupIndex: number) => void;
  isMovePending: boolean;
}

export const MoveParticipantSheet: React.FC<MoveParticipantSheetProps> = ({
  selectedParticipant,
  tourGroups,
  onClose,
  onMove,
  isMovePending
}) => {
  // Log what we're working with
  console.log("MoveParticipantSheet received:", { 
    selectedParticipant, 
    tourGroups,
    isMovePending 
  });
  
  if (!selectedParticipant || !selectedParticipant.participant) {
    console.error("MoveParticipantSheet missing participant data");
    return null;
  }
  
  // Get the participant and source group index
  const { participant, fromGroupIndex } = selectedParticipant;
  
  // Get the source group name for display
  const sourceGroupName = tourGroups[fromGroupIndex]?.name || `Group ${fromGroupIndex + 1}`;
  
  const handleMoveToGroup = (toGroupIndex: number) => {
    console.log(`Moving participant ${participant.id} from group ${fromGroupIndex} to group ${toGroupIndex}`);
    onMove(toGroupIndex);
  };
  
  return (
    <Sheet open={!!selectedParticipant} onOpenChange={open => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Move Participant</SheetTitle>
          <SheetDescription>
            Select a group to move <strong>{participant.name}</strong> to
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Currently in: <span className="font-medium">{sourceGroupName}</span>
          </p>
          
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium mb-2">Move to:</h4>
            
            {tourGroups.map((group, index) => {
              // Don't show the current group
              if (index === fromGroupIndex) return null;
              
              return (
                <Button
                  key={group.id || index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleMoveToGroup(index)}
                  disabled={isMovePending}
                >
                  {group.name || `Group ${index + 1}`}
                </Button>
              );
            })}
          </div>
        </div>
        
        {isMovePending && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Moving participant...</p>
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-6 flex justify-end">
          <SheetClose asChild>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
