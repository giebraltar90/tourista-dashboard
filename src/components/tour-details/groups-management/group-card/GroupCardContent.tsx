
import { ParticipantItem } from "../ParticipantItem";
import { ParticipantDropZone } from "../ParticipantDropZone";
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";

interface GroupCardContentProps {
  groupIndex: number;
  totalParticipants: number;
  localParticipants: VentrataParticipant[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onMoveClick: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onAssignGuide?: (groupIndex: number) => void;
  guideName: string;
}

export const GroupCardContent = ({
  groupIndex,
  totalParticipants,
  localParticipants,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending,
  onAssignGuide,
  guideName
}: GroupCardContentProps) => {
  return (
    <div className="space-y-2">
      <div
        className="min-h-[100px] rounded-md"
        data-drop-target="true"
        onDragOver={(e) => onDragOver(e)}
        onDragLeave={(e) => onDragLeave && onDragLeave(e)}
        onDrop={(e) => onDrop(e, groupIndex)}
      >
        {Array.isArray(localParticipants) && localParticipants.length > 0 ? (
          <div className="space-y-1">
            {localParticipants.map((participant, idx) => (
              <ParticipantItem
                key={`${participant.id}-${idx}`}
                participant={participant}
                onDragStart={(e) => onDragStart(e, participant, groupIndex)}
                onDragEnd={onDragEnd}
                onMoveClick={() => onMoveClick({ participant, fromGroupIndex: groupIndex })}
                isDragging={
                  selectedParticipant?.participant?.id === participant.id &&
                  selectedParticipant?.fromGroupIndex === groupIndex
                }
                disabled={isMovePending}
              />
            ))}
          </div>
        ) : (
          <ParticipantDropZone groupIndex={groupIndex}>
            {totalParticipants > 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                This group has {totalParticipants} participants but data isn't loaded.
                <br />
                Click refresh above to load participants.
              </p>
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                Drop participants here
              </p>
            )}
          </ParticipantDropZone>
        )}
      </div>
      
      {selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex && (
        <div className="mt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => handleMoveParticipant(groupIndex)}
            disabled={isMovePending}
          >
            {isMovePending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Moving...
              </>
            ) : (
              <>Move to this group</>
            )}
          </Button>
        </div>
      )}
      
      {onAssignGuide && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onAssignGuide(groupIndex)}
          >
            {guideName ? `Change Guide (${guideName})` : "Assign Guide"}
          </Button>
        </div>
      )}
    </div>
  );
};
