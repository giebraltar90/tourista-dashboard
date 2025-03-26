
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { GroupCardContainer } from "./group-card/GroupCardContainer";
import { useGroupCardState } from "./group-card";

interface GroupCardProps {
  group: VentrataTourGroup & { 
    displayName?: string;
    guideName?: string | null;
  };
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
  // Get guide information, using the cached guideName if available
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  // Use the cached guideName from the assignment if available, otherwise get it from guideId
  let guideName = group.guideName;
  let guideInfo = null;
  
  if (guideName === undefined) {
    // Fall back to calculating from guideId
    const result = getGuideNameAndInfo(group.guideId);
    guideName = result.name;
    guideInfo = result.info;
  } else if (group.guideId) {
    // We have a guideName but need the info
    guideInfo = getGuideNameAndInfo(group.guideId).info;
  }

  // Filter out unknown guides for display
  if (guideName && guideName.startsWith("Unknown")) {
    guideName = "Unassigned";
  }

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
    group.displayName || group.name || `Group ${groupIndex + 1}`,
    groupIndex,
    group.size,
    group.childCount,
    onRefreshParticipants
  );

  console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] rendering with:`, {
    groupId: group.id,
    groupName: group.displayName || group.name || `Group ${groupIndex + 1}`,
    guideName,
    participantsLength: Array.isArray(group.participants) ? group.participants.length : 0,
    displayParticipants
  });

  // Render the container component with all props
  return (
    <GroupCardContainer
      group={group}
      groupIndex={groupIndex}
      guideName={guideName || "Unassigned"}
      guideInfo={guideInfo}
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
      localParticipants={localParticipants}
      isRefreshing={isRefreshing}
      handleRefreshParticipants={handleRefreshParticipants}
      totalParticipants={totalParticipants}
      childCount={childCount}
      adultCount={adultCount}
      displayParticipants={displayParticipants}
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
