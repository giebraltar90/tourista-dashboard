
import { useState, useEffect } from "react";
import { GroupCard } from "./GroupCard";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupsGridProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd: (e?: React.DragEvent) => void; // Updated to make e parameter optional
  onMoveClick: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants?: () => void;
}

export const GroupsGrid = ({
  tourGroups,
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants
}: GroupsGridProps) => {
  const [noParticipantsWarning, setNoParticipantsWarning] = useState(false);
  const [missingParticipantsGroups, setMissingParticipantsGroups] = useState<string[]>([]);
  
  // Check if any groups have no participants or have placeholder participants
  useEffect(() => {
    // First check for groups with no participants but with size
    const hasNoParticipants = tourGroups.some(group => {
      const participantsEmpty = !Array.isArray(group.participants) || group.participants.length === 0;
      return participantsEmpty && (group.size > 0);
    });
    
    // Then check for groups with placeholder participants (created by our hook)
    const groupsWithPlaceholders = tourGroups
      .filter(group => {
        if (!Array.isArray(group.participants)) return false;
        return group.participants.some(p => 
          p.id?.toString().startsWith('placeholder-') || 
          p.id?.toString().startsWith('fallback-')
        );
      })
      .map(group => group.name || `Group ${tourGroups.indexOf(group) + 1}`);
    
    setNoParticipantsWarning(hasNoParticipants || groupsWithPlaceholders.length > 0);
    setMissingParticipantsGroups(groupsWithPlaceholders);
    
    console.log("GROUPS GRID: Participant data check:", {
      hasNoParticipants,
      groupsWithPlaceholders
    });
  }, [tourGroups]);
  
  return (
    <div className="space-y-6">
      {noParticipantsWarning && (
        <Alert variant="warning" className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {missingParticipantsGroups.length > 0 ? (
                <>
                  The following groups have placeholder data: <strong>{missingParticipantsGroups.join(', ')}</strong>. 
                  Refresh participants to get actual data.
                </>
              ) : (
                <>
                  Some groups show participant counts but no participant data is loaded. Refresh participants to view details.
                </>
              )}
            </AlertDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onRefreshParticipants}
            className="flex items-center"
            disabled={isMovePending}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isMovePending ? 'animate-spin' : ''}`} />
            Refresh Participants
          </Button>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {tourGroups.map((group, index) => {
          // Debug logging for each group
          console.log(`Rendering group ${index}:`, {
            id: group.id,
            name: group.name || `Group ${index + 1}`,
            size: group.size,
            childCount: group.childCount,
            hasParticipantsArray: Array.isArray(group.participants),
            participantsCount: Array.isArray(group.participants) ? group.participants.length : 0,
            participants: group.participants
          });
          
          return (
            <GroupCard
              key={`group-${group.id || index}`}
              group={group}
              groupIndex={index}
              tour={tour}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMoveClick={onMoveClick}
              selectedParticipant={selectedParticipant}
              handleMoveParticipant={handleMoveParticipant}
              isMovePending={isMovePending}
              onRefreshParticipants={onRefreshParticipants}
            />
          );
        })}
      </div>
    </div>
  );
};
