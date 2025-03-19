
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";
import { GroupCard } from "./GroupCard";
import { GuideInfo } from "@/types/ventrata";

interface GroupsGridProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  onDrop: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onMoveClick: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
  selectedParticipant: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
}

export const GroupsGrid = ({
  tourGroups,
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  onDrop,
  onDragOver,
  onDragStart,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending
}: GroupsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tourGroups.map((group, groupIndex) => (
        <GroupCard
          key={groupIndex}
          group={group}
          groupIndex={groupIndex}
          tour={tour}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onMoveClick={onMoveClick}
          selectedParticipant={selectedParticipant}
          handleMoveParticipant={handleMoveParticipant}
          isMovePending={isMovePending}
          guide1Info={guide1Info || null}
          guide2Info={guide2Info || null}
          guide3Info={guide3Info || null}
        />
      ))}
    </div>
  );
};
