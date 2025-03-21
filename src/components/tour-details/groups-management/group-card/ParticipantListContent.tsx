
import { Button } from "@/components/ui/button";
import { VentrataParticipant } from "@/types/ventrata";
import { ParticipantItem } from "../ParticipantItem";
import { AlertCircle, RefreshCw, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createTestParticipants } from "@/services/api/createParticipants";
import { toast } from "sonner";
import { useState } from "react";

interface ParticipantListContentProps {
  groupIndex: number;
  localParticipants: VentrataParticipant[];
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  handleParticipantDragStart: (e: React.DragEvent, participant: VentrataParticipant) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  handleParticipantMoveClick: (participant: VentrataParticipant) => void;
  isParticipantSelected: (participantId: string) => boolean;
  isMovePending: boolean;
  tourId?: string;
  onRefreshCallback?: () => void;
}

export const ParticipantListContent = ({
  groupIndex,
  localParticipants,
  onDragOver,
  onDragLeave,
  onDrop,
  handleParticipantDragStart,
  onDragEnd,
  handleParticipantMoveClick,
  isParticipantSelected,
  isMovePending,
  tourId,
  onRefreshCallback
}: ParticipantListContentProps) => {
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  
  // Check if we have any participant data
  const hasParticipantData = Array.isArray(localParticipants) && localParticipants.length > 0;
  
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
    <div
      className="space-y-2 rounded-md min-h-[100px] p-2"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, groupIndex)}
      data-drop-target="true"
    >
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
  );
};
