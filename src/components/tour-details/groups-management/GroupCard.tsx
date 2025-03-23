
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { GroupCardContainer } from "./group-card/GroupCardContainer";
import { useGroupCardState } from "./group-card";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onMoveClick: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants?: () => void;
  onAssignGuide?: (groupIndex: number) => void;
}

export const GroupCard = ({
  group,
  groupIndex,
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
  onRefreshParticipants,
  onAssignGuide
}: GroupCardProps) => {
  // Get guide information
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);

  // Use the extracted state management hook
  const {
    isExpanded,
    setIsExpanded,
    localParticipants,
    isRefreshing,
    handleRefreshParticipants,
    totalParticipants,
    childCount,
    adultCount,
    displayParticipants
  } = useGroupCardState(
    group.participants,
    group.id,
    group.name || `Group ${groupIndex + 1}`,
    groupIndex,
    group.size,
    group.childCount,
    onRefreshParticipants
  );

  console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] initial render with:`, {
    groupId: group.id,
    groupName: group.name || `Group ${groupIndex + 1}`,
    participantsLength: Array.isArray(group.participants) ? group.participants.length : 0
  });

  // Render the container component with all props
  return (
    <GroupCardContainer
      group={group}
      groupIndex={groupIndex}
      guideName={guideName}
      guideInfo={guideInfo}
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
      localParticipants={localParticipants}
      isRefreshing={isRefreshing}
      handleRefreshParticipants={handleRefreshParticipants}
      totalParticipants={totalParticipants}
      childCount={childCount}
      adultCount={adultCount}
      displayParticipants={displayParticipants.toString()} // Convert to string to fix the type error
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMoveClick={onMoveClick}
      selectedParticipant={selectedParticipant}
      handleMoveParticipant={handleMoveParticipant}
      isMovePending={isMovePending}
      onAssignGuide={onAssignGuide}
      tourId={tour.id}
      onRefreshCallback={onRefreshParticipants}
    />
  );
};
