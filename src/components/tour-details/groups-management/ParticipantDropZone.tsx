
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { useDropTarget } from "@/hooks/group-management/useDropTarget";

interface ParticipantDropZoneProps {
  groupIndex: number;
  onDrop?: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  children: React.ReactNode;
  isDropTarget?: boolean;
  onMoveHere?: (toGroupIndex: number) => void;
  isMoveTarget?: boolean;
  isMovePending?: boolean;
}

export const ParticipantDropZone = ({ 
  groupIndex,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragEnter,
  children,
  isDropTarget,
  onMoveHere,
  isMoveTarget,
  isMovePending
}: ParticipantDropZoneProps) => {
  const {
    isDragOver,
    handleDragEnter: handleLocalDragEnter,
    handleDragOver: handleLocalDragOver,
    handleDragLeave: handleLocalDragLeave,
    handleDrop: handleLocalDrop
  } = useDropTarget();
  
  const handleDragOver = (e: React.DragEvent) => {
    handleLocalDragOver(e);
    if (onDragOver) {
      onDragOver(e);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    handleLocalDragLeave(e);
    if (onDragLeave) {
      onDragLeave(e);
    }
  };
  
  const handleDragEnterEvent = (e: React.DragEvent) => {
    handleLocalDragEnter(e);
    if (onDragEnter) {
      onDragEnter(e);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    handleLocalDrop(e);
    if (onDrop) {
      console.log("Handling drop in ParticipantDropZone, groupIndex:", groupIndex);
      onDrop(e, groupIndex);
    }
  };

  return (
    <div 
      onDrop={handleDrop} 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnterEvent}
      className={`h-full relative rounded-md transition-all duration-200 ${
        isDragOver ? 'bg-primary/20 border-2 border-dashed border-primary ring-2 ring-primary/10 ring-offset-1' : ''
      } ${isMoveTarget ? 'border-2 border-dashed border-primary/60 rounded-md bg-primary/5' : ''}`}
      data-drop-target="true"
    >
      {children}
      
      {/* Show move-here button when in move mode and this is a valid target */}
      {isMoveTarget && (
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center">
          <Button
            onClick={() => onMoveHere?.(groupIndex)}
            disabled={isMovePending}
            variant="default"
            className="text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            {isMovePending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                Moving...
              </>
            ) : (
              <>
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Move Here
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
