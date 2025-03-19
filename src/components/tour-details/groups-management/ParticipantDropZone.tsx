
import { ParticipantDropZoneProps } from "@/components/tours/tour-card/types";

export const ParticipantDropZone = ({ 
  groupIndex,
  onDrop,
  onDragOver, 
  children 
}: ParticipantDropZoneProps) => {
  return (
    <div 
      onDrop={(e) => onDrop(e, groupIndex)} 
      onDragOver={onDragOver}
      className="h-full"
    >
      {children}
    </div>
  );
};
