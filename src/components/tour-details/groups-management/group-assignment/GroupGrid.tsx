
import { useMemo } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { useGuideInfo } from "@/hooks/guides";
import { GroupCard } from "../GroupCard";

interface GroupGridProps {
  tour: TourCardProps;
  localTourGroups: VentrataTourGroup[];
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
}

export const GroupGrid = ({ 
  tour,
  localTourGroups,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  onOpenAssignGuide,
  selectedParticipant,
  setSelectedParticipant,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants
}: GroupGridProps) => {
  // Get guide information
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
  const stableTourGroups = useMemo(() => {
    console.log("DATABASE DEBUG: Creating stable tour groups from:", {
      localTourGroupsLength: localTourGroups?.length || 0,
      tourGroupsLength: tour.tourGroups?.length || 0
    });
    
    if (!localTourGroups || localTourGroups.length === 0) {
      console.log("DATABASE DEBUG: Using tour.tourGroups as fallback");
      if (!tour.tourGroups) return [];
      
      return tour.tourGroups.map((group, index) => ({
        ...group,
        originalIndex: index,
        displayName: group.name || `Group ${index + 1}`
      }));
    }
    
    return localTourGroups.map((group, index) => ({
      ...group,
      originalIndex: index,
      displayName: group.name || `Group ${index + 1}`
    }));
  }, [localTourGroups, tour.tourGroups]);
  
  console.log("DATABASE DEBUG: Stable tour groups:", stableTourGroups.map(g => ({
    id: g.id,
    name: g.displayName,
    participantsCount: g.participants?.length || 0
  })));
  
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stableTourGroups.map((group) => {
          const index = group.originalIndex !== undefined ? group.originalIndex : 0;
          
          console.log(`DATABASE DEBUG: Rendering group ${index} (${group.displayName}):`, {
            id: group.id,
            participantsCount: Array.isArray(group.participants) ? group.participants.length : 0
          });
          
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
}
