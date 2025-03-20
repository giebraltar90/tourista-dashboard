
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, MoveHorizontal, GripVertical } from "lucide-react";
import { VentrataParticipant } from "@/types/ventrata";
import { useState } from "react";

interface ParticipantItemProps {
  participant: VentrataParticipant;
  groupIndex: number;
  onDragStart?: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onMoveClick?: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
}

export const ParticipantItem = ({ 
  participant, 
  groupIndex, 
  onDragStart,
  onDragEnd,
  onMoveClick
}: ParticipantItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      console.log("Handle drag start for participant:", participant.name);
      onDragStart(e, participant, groupIndex);
      setIsDragging(true);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border ${
        isDragging 
          ? 'border-primary/30 bg-primary/5 shadow-md opacity-50' 
          : 'border-transparent hover:border-muted'
      } transition-all duration-150 cursor-grab active:cursor-grabbing`}
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-participant-id={participant.id}
    >
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-muted-foreground mr-2 cursor-grab" />
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
        className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
      >
        <MoveHorizontal className="h-4 w-4 mr-2" />
        Move
      </Button>
    </div>
  );
};
