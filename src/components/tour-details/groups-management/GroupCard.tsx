
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { ParticipantDropZone } from "./ParticipantDropZone";
import { DraggableParticipant } from "./DraggableParticipant";
import { ParticipantItem } from "./ParticipantItem";
import { useGuideNameInfo } from "@/hooks/group-management";
import { Users } from "lucide-react";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
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
  guide1Info: any;
  guide2Info: any;
  guide3Info: any;
}

export const GroupCard = ({
  group,
  groupIndex,
  tour,
  onDrop,
  onDragOver,
  onDragStart,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending,
  guide1Info,
  guide2Info,
  guide3Info
}: GroupCardProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  // Calculate the actual participant count and total people
  const participantCount = group.participants?.length || 0;
  const participantTotalCount = group.participants?.reduce((sum, p) => sum + (p.count || 1), 0) || 0;
  
  // Get guide info directly using the guideId from the group
  const { name: guideName } = getGuideNameAndInfo(group.guideId);
  
  return (
    <ParticipantDropZone 
      groupIndex={groupIndex}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <Card className="border-2 border-muted">
        <CardHeader className="pb-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              {group.name}
              {group.childCount && group.childCount > 0 ? (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                  {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
                </Badge>
              ) : null}
            </CardTitle>
            <Badge variant="outline">
              {participantTotalCount} {participantTotalCount === 1 ? 'person' : 'people'}
            </Badge>
          </div>
          <CardDescription className="flex items-center">
            <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Guide: {guideName !== "Unassigned" ? guideName : "Unassigned"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {group.participants && group.participants.length > 0 ? (
              group.participants.map((participant) => (
                <DraggableParticipant
                  key={participant.id}
                  participant={participant}
                  groupIndex={groupIndex}
                  onDragStart={onDragStart}
                >
                  <ParticipantItem
                    participant={participant}
                    group={group}
                    groupIndex={groupIndex}
                    tour={tour}
                    onMoveClick={() => onMoveClick({
                      participant,
                      fromGroupIndex: groupIndex
                    })}
                    selectedParticipant={selectedParticipant}
                    handleMoveParticipant={handleMoveParticipant}
                    isPending={isMovePending}
                  />
                </DraggableParticipant>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No participants in this group
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </ParticipantDropZone>
  );
};
