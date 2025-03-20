
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, MoveHorizontal, GripVertical } from "lucide-react";
import { VentrataParticipant } from "@/types/ventrata";

interface ParticipantItemProps {
  participant: VentrataParticipant;
  groupIndex: number;
  onDragStart?: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onMoveClick?: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
}

export const ParticipantItem = ({ 
  participant, 
  groupIndex, 
  onDragStart,
  onMoveClick
}: ParticipantItemProps) => {
  return (
    <div 
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-muted transition-colors"
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, participant, groupIndex)}
    >
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="font-medium flex items-center">
            {participant.name}
            {participant.childCount ? (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                {participant.childCount} {participant.childCount === 1 ? 'child' : 'children'}
              </Badge>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {participant.count || 1} {(participant.count || 1) === 1 ? 'participant' : 'participants'} • Booking #{participant.bookingRef}
          </div>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onMoveClick?.({ participant, fromGroupIndex: groupIndex })}
      >
        <MoveHorizontal className="h-4 w-4 mr-2" />
        Move
      </Button>
    </div>
  );
};
