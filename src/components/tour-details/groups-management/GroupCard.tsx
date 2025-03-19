
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { ParticipantDropZone } from "./ParticipantDropZone";
import { DraggableParticipant } from "./DraggableParticipant";
import { ParticipantItem } from "./ParticipantItem";
import { useGuideNameInfo } from "@/hooks/group-management";
import { Users, UserPlus, Edit } from "lucide-react";

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
  onAssignGuide: (groupIndex: number) => void;
  onEditGroup: (groupIndex: number) => void;
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
  guide3Info,
  onAssignGuide,
  onEditGroup
}: GroupCardProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  // Calculate the actual participant count and total participants
  // Safely access group.participants, defaulting to empty array if undefined
  const participants = group.participants || [];
  const participantCount = participants.length || 0;
  const totalParticipants = group.size || 0;
  
  // Get guide info directly using the guideId from the group
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
  
  // Use default group name if not set
  const displayName = group.name || `Group ${groupIndex + 1}`;
  
  return (
    <ParticipantDropZone 
      groupIndex={groupIndex}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <Card className={`border-2 ${guideName !== "Unassigned" ? "border-green-200" : "border-muted"}`}>
        <CardHeader className="pb-2 bg-muted/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">
                {displayName}
                {group.childCount && group.childCount > 0 ? (
                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                    {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
                  </Badge>
                ) : null}
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2" 
                onClick={() => onEditGroup(groupIndex)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Badge variant="outline">
              {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <CardDescription className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <span>Guide: </span>
              {guideName !== "Unassigned" ? (
                <Badge variant="outline" className="ml-1.5 bg-green-100 text-green-800">
                  {guideName}
                  {guideInfo?.guideType && <span className="ml-1">({guideInfo.guideType})</span>}
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-1.5 bg-yellow-100 text-yellow-800">
                  Unassigned
                </Badge>
              )}
            </CardDescription>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2" 
              onClick={() => onAssignGuide(groupIndex)}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Assign</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {participants && participants.length > 0 ? (
              participants.map((participant) => (
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
