
import { DraggableParticipantProps } from "@/components/tours/tour-card/types";

export const DraggableParticipant = ({ 
  participant,
  groupIndex,
  onDragStart,
  children 
}: DraggableParticipantProps & { children: React.ReactNode }) => {
  return (
    <div 
      draggable={true}
      onDragStart={(e) => onDragStart(e, participant, groupIndex)}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
};
