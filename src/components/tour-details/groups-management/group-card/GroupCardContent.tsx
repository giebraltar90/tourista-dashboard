
import { VentrataParticipant } from "@/types/ventrata";
import { useParticipantHandlers } from "./useParticipantHandlers";
import { GuideSection } from "./GuideSection";
import { MoveTargetBanner } from "./MoveTargetBanner";
import { ParticipantListContent } from "./ParticipantListContent";

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
  // Use our custom hook for participant handlers
  const {
    handleParticipantDragStart,
    handleParticipantMoveClick,
    isParticipantSelected,
    handleMoveToThisGroup,
    isTransferring
  } = useParticipantHandlers(
    groupIndex,
    onDragStart,
    onDragEnd,
    onMoveClick,
    selectedParticipant,
    handleMoveParticipant
  );
  
  // Handle guide selection click
  const handleGuideClick = () => {
    if (typeof onAssignGuide === 'function') {
      onAssignGuide(groupIndex);
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Guide section */}
      <GuideSection 
        guideName={guideName}
        onGuideClick={handleGuideClick}
      />
      
      {/* Move target banner */}
      <MoveTargetBanner
        selectedParticipant={selectedParticipant}
        groupIndex={groupIndex}
        isMovePending={isMovePending}
        isTransferring={isTransferring}
        onMoveToThisGroup={handleMoveToThisGroup}
      />
      
      {/* Participants list content */}
      <ParticipantListContent
        groupIndex={groupIndex}
        localParticipants={localParticipants}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        handleParticipantDragStart={handleParticipantDragStart}
        onDragEnd={onDragEnd}
        handleParticipantMoveClick={handleParticipantMoveClick}
        isParticipantSelected={isParticipantSelected}
        isMovePending={isMovePending}
        tourId={tourId}
        onRefreshCallback={onRefreshCallback}
      />
    </div>
  );
};
