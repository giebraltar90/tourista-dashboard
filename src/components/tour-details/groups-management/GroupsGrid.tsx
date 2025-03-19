
import React from "react";
import { VentrataParticipant, VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupCard } from "./GroupCard";

interface GroupsGridProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onDrop: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onMoveClick: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
  selectedParticipant: { participant: VentrataParticipant, fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onAssignGuide: (groupIndex: number) => void;
}

export const GroupsGrid: React.FC<GroupsGridProps> = ({
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
  isMovePending,
  onAssignGuide
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tourGroups.map((group, index) => (
        <GroupCard
          key={index}
          group={group}
          groupIndex={index}
          tour={tour}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragStart={onDragStart}
          onMoveClick={onMoveClick}
          selectedParticipant={selectedParticipant}
          handleMoveParticipant={handleMoveParticipant}
          isMovePending={isMovePending}
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          guide3Info={guide3Info}
          onAssignGuide={onAssignGuide}
        />
      ))}
    </div>
  );
};
