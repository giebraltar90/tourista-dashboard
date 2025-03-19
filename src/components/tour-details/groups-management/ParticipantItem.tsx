
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, MoveHorizontal, Users, GripVertical } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";
import { MoveParticipantSheet } from "./MoveParticipantSheet";

interface ParticipantItemProps {
  participant: VentrataParticipant;
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  onMoveClick: () => void;
  selectedParticipant: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isPending: boolean;
}

export const ParticipantItem = ({ 
  participant, 
  group, 
  groupIndex, 
  tour, 
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isPending
}: ParticipantItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-muted transition-colors">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="font-medium flex items-center">
            {participant.name}
            {participant.childCount ? (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                {participant.childCount} {participant.childCount === 1 ? 'child' : 'children'}
              </Badge>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {participant.count} {participant.count === 1 ? 'person' : 'people'} • Booking #{participant.bookingRef}
          </div>
        </div>
      </div>
      
      <MoveParticipantSheet
        participant={participant}
        group={group}
        groupIndex={groupIndex}
        tour={tour}
        onMoveClick={onMoveClick}
        handleMoveParticipant={handleMoveParticipant}
        isPending={isPending}
      />
    </div>
  );
};
