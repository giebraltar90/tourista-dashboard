
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
  
  // Calculate participant counts from the participants array directly for accuracy
  const participants = Array.isArray(group.participants) ? group.participants : [];
  
  // Calculate the total number of actual people (accounting for participants with count > 1)
  const totalParticipants = participants.reduce((sum, p) => sum + (p.count || 1), 0) || group.size || 0;
  
  // Calculate total child count
  const totalChildCount = participants.reduce((sum, p) => sum + (p.childCount || 0), 0) || group.childCount || 0;
  
  // Format participant counts consistently with the (adults+children) format
  const formattedParticipantCount = totalChildCount > 0 
    ? `${totalParticipants - totalChildCount}+${totalChildCount}`
    : `${totalParticipants}`;
  
  // Get guide info directly using the guideId from the group
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
  
  // Use standardized group name
  const displayName = `Group ${groupIndex + 1}`;
  
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
              </CardTitle>
            </div>
            <Badge variant="outline">
              {formattedParticipantCount} {totalParticipants === 1 ? 'participant' : 'participants'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <CardDescription className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <span>Guide: </span>
              {guideName !== "Unassigned" ? (
                <Badge variant="outline" className="ml-1.5 bg-green-100 text-green-800">
                  {guideName}
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-1.5 bg-yellow-100 text-yellow-800">
                  Unassigned
                </Badge>
              )}
            </CardDescription>
            
            {totalChildCount > 0 && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {totalChildCount} {totalChildCount === 1 ? 'child' : 'children'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {participants.length > 0 ? (
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
