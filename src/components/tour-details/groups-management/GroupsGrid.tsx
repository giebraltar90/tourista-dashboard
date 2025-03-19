
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";
import { GroupCard } from "./GroupCard";

interface GroupsGridProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
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
        />
      ))}
    </div>
  );
};
