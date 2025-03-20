
import { VentrataParticipant } from "@/types/ventrata";
import { UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ParticipantItemProps {
  participant: VentrataParticipant;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMoveClick: () => void;
  disabled?: boolean;
  isDragging?: boolean; // Changed isSelected to isDragging
}

export const ParticipantItem = ({
  participant,
  onDragStart,
  onDragEnd,
  onMoveClick,
  disabled = false,
  isDragging = false // Changed isSelected to isDragging
}: ParticipantItemProps) => {
  // Format participant name and count
  const totalCount = (participant.count || 1);
  const childCount = participant.childCount || 0;
  const adultCount = totalCount - childCount;
  
  // Determine how to display the count
  const hasChildren = childCount > 0;
  const countDisplay = hasChildren
    ? `${adultCount}+${childCount}`
    : totalCount.toString();
  
  return (
    <div
      className={`bg-white border rounded-md p-2 flex items-center justify-between cursor-grab ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-200"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-participant-id={participant.id}
    >
      <div className="flex items-center space-x-2">
        <UserIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm truncate max-w-[150px]">
          {participant.name || "Unnamed"}
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <Badge variant="outline" className="text-xs">
          {countDisplay}
        </Badge>
        
        <button
          className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          onClick={onMoveClick}
          disabled={disabled}
        >
          Move
        </button>
      </div>
    </div>
  );
};
