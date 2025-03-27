
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { GroupGrid } from "./group-assignment/GroupGrid";

interface GuideAssignment {
  groupId: string;
  guideId: string | null;
  guideName: string | null;
  groupIndex: number;
  groupName: string;
}

interface GroupsGridProps {
  tour: TourCardProps;
  localTourGroups: VentrataTourGroup[];
  guideAssignments?: GuideAssignment[];
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
  onOpenAssignGuide: (groupIndex: number) => void;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GroupsGrid = ({
  tour,
  localTourGroups,
  guideAssignments = [],
  selectedParticipant,
  setSelectedParticipant,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants,
  onOpenAssignGuide,
  guide1Info,
  guide2Info,
  guide3Info
}: GroupsGridProps) => {
  console.log("GroupsGrid rendering with localTourGroups:", localTourGroups?.length || 0);

  return (
    <GroupGrid
      tour={tour}
      localTourGroups={localTourGroups}
      guideAssignments={guideAssignments}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDragLeave={handleDragLeave}
      handleDrop={handleDrop}
      onOpenAssignGuide={onOpenAssignGuide}
      selectedParticipant={selectedParticipant}
      setSelectedParticipant={setSelectedParticipant}
      handleMoveParticipant={handleMoveParticipant}
      isMovePending={isMovePending}
      onRefreshParticipants={onRefreshParticipants}
      guide1Info={guide1Info}
      guide2Info={guide2Info}
      guide3Info={guide3Info}
    />
  );
};
