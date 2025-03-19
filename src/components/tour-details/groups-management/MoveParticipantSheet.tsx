
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoveHorizontal, Users, ArrowLeftRight } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useState } from "react";

interface MoveParticipantSheetProps {
  participant: VentrataParticipant;
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  onMoveClick: () => void;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isPending: boolean;
}

export const MoveParticipantSheet = ({
  participant,
  group,
  groupIndex,
  tour,
  onMoveClick,
  handleMoveParticipant,
  isPending
}: MoveParticipantSheetProps) => {
  // State to track selected target group
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  
  // Verify tour groups exist before rendering
  if (!tour.tourGroups || tour.tourGroups.length === 0) {
    return null;
  }

  // Handle move confirmation
  const confirmMove = () => {
    if (selectedGroup !== null) {
      const targetGroupIndex = parseInt(selectedGroup);
      handleMoveParticipant(targetGroupIndex);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onMoveClick}
        >
          <MoveHorizontal className="h-4 w-4 mr-2" />
          Move
        </Button>
      </SheetTrigger>
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
                Currently in: {group.name || `Group ${groupIndex + 1}`}
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
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {tour.tourGroups.map((g, i) => (
                    i !== groupIndex && (
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
            disabled={isPending || selectedGroup === null}
            onClick={confirmMove}
          >
            {isPending ? (
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
