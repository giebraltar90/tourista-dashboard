
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { GroupGrid } from "./group-assignment/GroupGrid";

interface GroupsGridProps {
  tour: TourCardProps;
  localTourGroups: VentrataTourGroup[];
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  setSelectedParticipant: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  handleDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, groupIndex: number) => void;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants: () => void;
}

export const GroupsGrid = ({
  tour,
  localTourGroups,
  selectedParticipant,
  setSelectedParticipant,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants
}: GroupsGridProps) => {
  console.log("GroupsGrid rendering with localTourGroups:", localTourGroups?.length || 0);
  
  // Default handler for assign guide
  const handleOpenAssignGuide = (groupIndex: number) => {
    console.log("Open assign guide for group:", groupIndex);
    // This is just a placeholder as the actual implementation happens in the parent
  };

  return (
    <GroupGrid
      tour={tour}
      localTourGroups={localTourGroups}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragLeave={handleDragLeave}
      handleDrop={handleDrop}
      onOpenAssignGuide={handleOpenAssignGuide}
      selectedParticipant={selectedParticipant}
      setSelectedParticipant={setSelectedParticipant}
      handleMoveParticipant={handleMoveParticipant}
      isMovePending={isMovePending}
      onRefreshParticipants={onRefreshParticipants}
    />
  );
};
