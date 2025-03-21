
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { GroupCardHeader, GroupCardContent, useGroupCardState } from "./index";

interface GroupCardContainerProps {
  group: VentrataTourGroup;
  groupIndex: number;
  guideName: string;
  guideInfo: any;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  localParticipants: any[];
  isRefreshing: boolean;
  handleRefreshParticipants: () => void;
  totalParticipants: number;
  childCount: number;
  adultCount: number;
  displayParticipants: string;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  onDragStart: (e: React.DragEvent, participant: any, fromGroupIndex: number) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onMoveClick: (data: { participant: any; fromGroupIndex: number }) => void;
  selectedParticipant: { participant: any; fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onAssignGuide?: (groupIndex: number) => void;
  tourId?: string;
  onRefreshCallback?: () => void;
}

export const GroupCardContainer = ({
  group,
  groupIndex,
  guideName,
  guideInfo,
  isExpanded,
  setIsExpanded,
  localParticipants,
  isRefreshing,
  handleRefreshParticipants,
  totalParticipants,
  childCount,
  adultCount,
  displayParticipants,
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
  tourId,
  onRefreshCallback
}: GroupCardContainerProps) => {
  console.log(`PARTICIPANTS DEBUG: GroupCardContainer[${groupIndex}] rendering with:`, {
    groupId: group.id,
    groupName: group.name || `Group ${groupIndex + 1}`,
    totalParticipants,
    childCount,
    adultCount,
    displayParticipants,
    participantsCount: localParticipants.length
  });

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <GroupCardHeader
          groupName={group.name || `Group ${groupIndex + 1}`}
          displayParticipants={displayParticipants}
          totalParticipants={totalParticipants}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          handleRefreshParticipants={handleRefreshParticipants}
          isRefreshing={isRefreshing}
        />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pb-3 pt-0">
          <GroupCardContent
            groupIndex={groupIndex}
            totalParticipants={totalParticipants}
            localParticipants={localParticipants}
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
            guideName={guideName}
            tourId={tourId}
            onRefreshCallback={onRefreshCallback}
          />
        </CardContent>
      )}
    </Card>
  );
};
