
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";
import { UserRound, ChevronRight, Users } from "lucide-react";

export interface ParticipantItemProps {
  participant: VentrataParticipant;
  groupIndex: number; // Added missing prop
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMoveClick: () => void;
  isDragging?: boolean;
  disabled?: boolean;
  isSelected?: boolean;
  isMovePending?: boolean;
}

export const ParticipantItem = ({
  participant,
  groupIndex, // Added to function parameters
  onDragStart,
  onDragEnd,
  onMoveClick,
  isDragging,
  disabled,
  isSelected,
  isMovePending
}: ParticipantItemProps) => {
  // Format participant count to show nicely
  const formattedCount = participant.childCount 
    ? `${(participant.count || 1) - (participant.childCount || 0)}+${participant.childCount}`
    : participant.count || 1;

  return (
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-md border ${
        isDragging || isSelected ? "bg-muted border-primary" : "bg-card hover:bg-accent/10"
      } cursor-grab flex items-center justify-between p-2 transition-colors`}
      data-participant-id={participant.id}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="truncate flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-medium truncate">{participant.name}</span>
            {participant.bookingRef && (
              <span className="ml-1 text-xs text-muted-foreground">| #{participant.bookingRef}</span>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{formattedCount}</span>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={onMoveClick}
        disabled={disabled || isMovePending}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Move</span>
      </Button>
    </div>
  );
};
