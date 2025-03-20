
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface ParticipantDropZoneProps {
  groupIndex: number;
  onDrop?: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
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
  children,
  isDropTarget,
  onMoveHere,
  isMoveTarget,
  isMovePending
}: ParticipantDropZoneProps) => {
  return (
    <div 
      onDrop={(e) => onDrop?.(e, groupIndex)} 
      onDragOver={onDragOver}
      className={`h-full relative ${isMoveTarget ? 'border-2 border-dashed border-primary/60 rounded-md' : ''}`}
    >
      {children}
      
      {/* Show move-here button when in move mode and this is a valid target */}
      {isMoveTarget && (
        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center">
          <Button
            onClick={() => onMoveHere?.(groupIndex)}
            disabled={isMovePending}
            variant="default"
            className="text-sm"
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
