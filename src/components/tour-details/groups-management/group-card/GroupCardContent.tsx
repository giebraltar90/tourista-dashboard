
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";
import { ParticipantItem } from "../ParticipantItem";
import { AlertCircle, Users, RefreshCw } from "lucide-react";
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
  const isDropTargetActive = selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex;
  const shouldShowMoveHere = isDropTargetActive && !isMovePending;
  
  const moveHereHandler = () => {
    if (isDropTargetActive && !isMovePending) {
      handleMoveParticipant(groupIndex);
    }
  };
  
  console.log(`GROUP CONTENT: Rendering participants for group ${groupIndex}:`, {
    totalParticipants,
    participantsCount: localParticipants.length,
    participants: localParticipants
  });
  
  return (
    <div 
      className={`space-y-3 relative ${
        shouldShowMoveHere ? 'bg-primary/5 border-2 border-dashed border-primary/30 rounded-md p-2' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, groupIndex)}
    >
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
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex flex-col space-y-2">
              <span className="text-amber-800">No participants data available. Please load participants to see them.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 border-amber-300 hover:bg-amber-100"
                onClick={() => window.dispatchEvent(new CustomEvent('refresh-participants'))}
              >
                <RefreshCw className="h-3 w-3 mr-2" /> 
                Refresh Participants
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {localParticipants.map((participant) => (
              <ParticipantItem
                key={participant.id}
                participant={participant}
                groupIndex={groupIndex}
                onDragStart={(e) => onDragStart(e, participant, groupIndex)}
                onDragEnd={() => onDragEnd()}
                onMoveClick={() => onMoveClick({ participant, fromGroupIndex: groupIndex })}
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
