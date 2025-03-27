
import { useMemo } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { GroupCard } from "../GroupCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GuideAssignment {
  groupId: string;
  guideId: string | null;
  guideName: string | null;
  groupIndex: number;
  groupName: string;
}

interface GroupGridProps {
  tour: TourCardProps;
  localTourGroups: VentrataTourGroup[];
  guideAssignments?: GuideAssignment[];
  handleDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, groupIndex: number) => void;
  onOpenAssignGuide: (groupIndex: number) => void;
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  setSelectedParticipant: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants: () => void;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GroupGrid = ({ 
  tour,
  localTourGroups,
  guideAssignments = [],
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  onOpenAssignGuide,
  selectedParticipant,
  setSelectedParticipant,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants,
  guide1Info,
  guide2Info,
  guide3Info
}: GroupGridProps) => {
  console.log("DATABASE DEBUG: GroupGrid rendering with", {
    localTourGroupsLength: localTourGroups?.length || 0,
    tourGroupsLength: tour?.tourGroups?.length || 0,
    hasParticipants: localTourGroups?.some(g => g.participants?.length > 0),
    guideAssignmentsLength: guideAssignments?.length || 0
  });
  
  const stableTourGroups = useMemo(() => {
    if (!localTourGroups || localTourGroups.length === 0) {
      console.log("DATABASE DEBUG: Using tour.tourGroups as fallback");
      if (!tour?.tourGroups) return [];
      
      return tour.tourGroups.map((group, index) => {
        // Find matching guide assignment
        const assignment = guideAssignments.find(a => a.groupId === group.id);
        
        return {
          ...group,
          originalIndex: index,
          displayName: assignment?.groupName || group.name || `Group ${index + 1}`,
          guideName: assignment?.guideName
        };
      });
    }
    
    return localTourGroups.map((group, index) => {
      // Find matching guide assignment
      const assignment = guideAssignments.find(a => a.groupId === group.id);
      
      return {
        ...group,
        originalIndex: index,
        displayName: assignment?.groupName || group.name || `Group ${index + 1}`,
        guideName: assignment?.guideName
      };
    });
  }, [localTourGroups, tour?.tourGroups, guideAssignments]);
  
  if (!stableTourGroups || stableTourGroups.length === 0) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          No tour groups available. Please try adding test participants.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stableTourGroups.map((group) => {
          const index = group.originalIndex !== undefined ? group.originalIndex : 0;
          
          return (
            <GroupCard
              key={group.id || index}
              group={group}
              groupIndex={index}
              tour={tour}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
              onAssignGuide={onOpenAssignGuide}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragStart={handleDragStart}
              onDragEnd={() => {}} // Empty function to satisfy prop
              onMoveClick={setSelectedParticipant}
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
