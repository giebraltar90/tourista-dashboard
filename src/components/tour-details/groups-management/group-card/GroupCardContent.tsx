
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";
import { ParticipantItem } from "../ParticipantItem";
import { AlertCircle, Users, RefreshCw, Database, Info, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createTestParticipants } from "@/services/api/createParticipants";
import { toast } from "sonner";
import { useState } from "react";

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
  tourId?: string;
  onRefreshCallback?: () => void;
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
  guideName,
  tourId,
  onRefreshCallback
}: GroupCardContentProps) => {
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  
  // Check if we have any participant data
  const hasParticipantData = Array.isArray(localParticipants) && localParticipants.length > 0;
  
  // Handle guide selection click
  const handleGuideClick = () => {
    if (typeof onAssignGuide === 'function') {
      onAssignGuide(groupIndex);
    }
  };
  
  // Handle drag start for a participant
  const handleParticipantDragStart = (e: React.DragEvent, participant: VentrataParticipant) => {
    onDragStart(e, participant, groupIndex);
  };
  
  // Handle move click for a participant
  const handleParticipantMoveClick = (participant: VentrataParticipant) => {
    onMoveClick({ participant, fromGroupIndex: groupIndex });
  };
  
  // Check if a participant is currently selected
  const isParticipantSelected = (participantId: string) => {
    return selectedParticipant && 
           selectedParticipant.participant.id === participantId && 
           selectedParticipant.fromGroupIndex === groupIndex;
  };
  
  // Handle move to this group click
  const handleMoveToThisGroup = () => {
    if (selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex) {
      handleMoveParticipant(groupIndex);
    }
  };
  
  // Create test participants
  const handleCreateTestParticipants = async () => {
    if (!tourId) {
      toast.error("No tour ID available to create test participants");
      return;
    }
    
    setIsCreatingTestData(true);
    
    try {
      const result = await createTestParticipants(tourId);
      
      if (result.success) {
        toast.success("Test participants created successfully");
        
        // Call refresh callback if provided
        if (typeof onRefreshCallback === 'function') {
          onRefreshCallback();
        }
      } else {
        toast.error(`Failed to create test participants: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating test participants:", error);
      toast.error("An error occurred while creating test participants");
    } finally {
      setIsCreatingTestData(false);
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Display guide or assign guide button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground mr-1">Guide:</span>
          <span className="font-medium">{guideName || "None"}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGuideClick}
        >
          {guideName ? "Change Guide" : "Assign Guide"}
        </Button>
      </div>
      
      {/* Participants list or empty state */}
      <div
        className="space-y-2 rounded-md min-h-[100px] p-2"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, groupIndex)}
        data-drop-target="true"
      >
        {/* Selected participant move target */}
        {selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex && (
          <div className="bg-primary/10 border border-primary/30 rounded-md p-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Move <span className="font-medium">{selectedParticipant.participant.name}</span> to this group?
              </span>
              <Button 
                size="sm" 
                variant="default"
                onClick={handleMoveToThisGroup}
                disabled={isMovePending}
              >
                {isMovePending ? "Moving..." : "Move Here"}
              </Button>
            </div>
          </div>
        )}
        
        {/* No participants alert */}
        {!hasParticipantData && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Alert variant="default" className="bg-muted/40 border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-muted-foreground">No participants in this group.</p>
                  {tourId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateTestParticipants}
                      disabled={isCreatingTestData}
                      className="flex items-center"
                    >
                      {isCreatingTestData ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-1" />
                      )}
                      {isCreatingTestData ? "Creating..." : "Create Test Participants"}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Participants list */}
        {hasParticipantData && localParticipants.map((participant) => (
          <ParticipantItem
            key={participant.id || `${groupIndex}-${participant.name}`}
            participant={participant}
            groupIndex={groupIndex}
            onDragStart={(e) => handleParticipantDragStart(e, participant)}
            onDragEnd={onDragEnd}
            onMoveClick={() => handleParticipantMoveClick(participant)}
            isSelected={isParticipantSelected(participant.id || '')}
            isMovePending={isMovePending}
          />
        ))}
      </div>
    </div>
  );
};
