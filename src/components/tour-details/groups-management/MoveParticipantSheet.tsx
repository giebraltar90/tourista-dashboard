
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoveHorizontal, Users, ArrowLeftRight } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { useState } from "react";

interface MoveParticipantSheetProps {
  selectedParticipant: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null;
  tourGroups: VentrataTourGroup[];
  onClose: () => void;
  onMove: (toGroupIndex: number) => void;
  isMovePending: boolean;
}

export const MoveParticipantSheet = ({
  selectedParticipant,
  tourGroups,
  onClose,
  onMove,
  isMovePending
}: MoveParticipantSheetProps) => {
  // State to track selected target group
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  // If no participant is selected, don't render the sheet
  if (!selectedParticipant) {
    return null;
  }
  
  const { participant, fromGroupIndex } = selectedParticipant;
  
  // Get source group name
  const sourceGroup = tourGroups[fromGroupIndex];
  const sourceGroupName = sourceGroup?.name || `Group ${fromGroupIndex + 1}`;

  // Handle move confirmation
  const confirmMove = () => {
    if (selectedGroup !== null) {
      const targetGroupIndex = parseInt(selectedGroup);
      onMove(targetGroupIndex);
    }
  };

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Move Participant</SheetTitle>
          <SheetDescription>
            Move {participant.name} ({participant.count} {participant.count === 1 ? 'person' : 'people'}) to another group
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="font-medium">{participant.name}</div>
              <div className="text-sm text-muted-foreground">
                Currently in: {sourceGroupName}
              </div>
              <div className="text-sm text-muted-foreground">
                Booking Reference: {participant.bookingRef}
              </div>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{participant.count} {participant.count === 1 ? 'person' : 'people'}</span>
                {participant.childCount ? (
                  <span className="ml-2 text-blue-600 text-sm">
                    (incl. {participant.childCount} {participant.childCount === 1 ? 'child' : 'children'})
                  </span>
                ) : null}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Destination Group
              </label>
              <Select 
                onValueChange={(value) => setSelectedGroup(value)}
                disabled={isMovePending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {tourGroups.map((g, i) => (
                    i !== fromGroupIndex && (
                      <SelectItem key={i} value={i.toString()}>
                        {g.name || `Group ${i + 1}`} ({g.size || 0} {g.size === 1 ? 'person' : 'people'})
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button 
            type="submit" 
            disabled={isMovePending || selectedGroup === null}
            onClick={confirmMove}
          >
            {isMovePending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                Moving...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Move Participant
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
