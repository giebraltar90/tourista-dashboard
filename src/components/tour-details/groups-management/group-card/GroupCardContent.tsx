
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";
import { ParticipantItem } from "../ParticipantItem";
import { AlertCircle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  guideName?: string;
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
  // Check if we're looking at placeholder data
  const hasPlaceholders = localParticipants.some(p => 
    String(p.id).startsWith('placeholder-') || String(p.id).startsWith('fallback-')
  );
  
  console.log(`GROUP CONTENT: Rendering participants for group ${groupIndex}:`, {
    totalParticipants,
    participantsCount: localParticipants.length,
    hasPlaceholders,
    participants: localParticipants
  });
  
  const isDropTargetActive = selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex;
  const shouldShowMoveHere = isDropTargetActive && !isMovePending;
  
  const moveHereHandler = () => {
    if (isDropTargetActive && !isMovePending) {
      handleMoveParticipant(groupIndex);
    }
  };
  
  return (
    <div 
      className={`space-y-3 relative ${
        shouldShowMoveHere ? 'bg-primary/5 border-2 border-dashed border-primary/30 rounded-md p-2' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, groupIndex)}
    >
      {hasPlaceholders && (
        <Alert variant="warning" className="mb-3 py-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            This group has placeholder data. Refresh to try loading actual participants.
          </AlertDescription>
        </Alert>
      )}
      
      {shouldShowMoveHere && (
        <div className="absolute inset-0 bg-primary/10 rounded flex items-center justify-center z-10">
          <Button 
            variant="default" 
            size="sm" 
            onClick={moveHereHandler}
            disabled={isMovePending}
            className="animate-pulse"
          >
            {isMovePending ? "Moving..." : "Move Here"}
          </Button>
        </div>
      )}
      
      {/* Guide info row */}
      <div className="flex gap-2 items-center">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Guide:</span>
        <span className="text-sm">{guideName || "No guide assigned"}</span>
        
        {onAssignGuide && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto text-xs h-7 px-2"
            onClick={() => onAssignGuide(groupIndex)}
          >
            {guideName ? "Change Guide" : "Assign Guide"}
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Participants ({localParticipants.length})</h4>
        
        {localParticipants.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2 text-center border rounded-md">
            No participants in this group
          </div>
        ) : (
          <div className="space-y-2">
            {localParticipants.map((participant) => (
              <ParticipantItem
                key={participant.id}
                participant={participant}
                groupIndex={groupIndex}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onMoveClick={onMoveClick}
                isSelected={selectedParticipant?.participant.id === participant.id}
                isMovePending={isMovePending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
