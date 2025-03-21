
import { Card } from "@/components/ui/card";
import { VentrataParticipant } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { GripVertical, User, Users } from "lucide-react";

export interface ParticipantItemProps {
  participant: VentrataParticipant;
  groupIndex: number;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onMoveClick: () => void;
  isSelected: boolean;
  isMovePending: boolean;
}

export const ParticipantItem = ({
  participant,
  groupIndex,
  onDragStart,
  onDragEnd,
  onMoveClick,
  isSelected,
  isMovePending
}: ParticipantItemProps) => {
  // Calculate total count
  const totalCount = participant.count || 1;
  const childCount = participant.childCount || 0;
  const adultCount = totalCount - childCount;
  
  // Format display label
  const countLabel = childCount > 0 
    ? `${adultCount}+${childCount}` 
    : `${totalCount}`;
  
  return (
    <Card
      className={`p-2 shadow-sm relative ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-participant-id={participant.id}
      data-group-index={groupIndex}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{participant.name}</span>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded px-1.5 py-0.5">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">{countLabel}</span>
            </div>
          </div>
          {participant.bookingRef && (
            <div className="text-xs text-muted-foreground">
              Ref: {participant.bookingRef}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-7"
          onClick={onMoveClick}
          disabled={isMovePending}
        >
          {isMovePending && isSelected ? "Moving..." : "Move"}
        </Button>
      </div>
    </Card>
  );
};
