
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { ParticipantDropZone } from "./ParticipantDropZone";
import { DraggableParticipant } from "./DraggableParticipant";
import { ParticipantItem } from "./ParticipantItem";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { Users, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { assignGuide } = useAssignGuide(tour?.id || "");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  
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
  
  // Create guide options for selection
  const guideOptions = [
    { id: "_none", name: "Unassign", info: null },
    ...(tour.guide1 ? [{ id: "guide1", name: tour.guide1, info: guide1Info }] : []),
    ...(tour.guide2 ? [{ id: "guide2", name: tour.guide2, info: guide2Info }] : []),
    ...(tour.guide3 ? [{ id: "guide3", name: tour.guide3, info: guide3Info }] : [])
  ];
  
  const handleAssignGuide = async (guideId: string) => {
    setIsAssigning(true);
    setIsSelecting(false);
    
    try {
      await assignGuide(groupIndex, guideId === "_none" ? undefined : guideId);
    } finally {
      setIsAssigning(false);
    }
  };
  
  const isGuideAssigned = guideName !== "Unassigned";
  
  return (
    <ParticipantDropZone 
      groupIndex={groupIndex}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <Card className={`border-2 ${isGuideAssigned ? "border-green-200" : "border-muted"}`}>
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
            <div className="flex items-center gap-1">
              <div className={`p-1 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-amber-100'}`}>
                {isGuideAssigned ? 
                  <UserCheck className="h-3.5 w-3.5 text-green-600" /> : 
                  <UserX className="h-3.5 w-3.5 text-amber-600" />
                }
              </div>
              
              {isSelecting ? (
                <Select onValueChange={handleAssignGuide} defaultValue={group.guideId || "_none"}>
                  <SelectTrigger className="h-7 w-40">
                    <SelectValue placeholder="Select guide" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Unassigned</SelectItem>
                    {guideOptions.filter(g => g.id !== "_none").map((guide) => (
                      <SelectItem key={guide.id} value={guide.id}>
                        {guide.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <span className="text-sm">Guide: </span>
                  {isGuideAssigned ? (
                    <Badge variant="outline" className="ml-1 bg-green-100 text-green-800">
                      {guideName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-800">
                      Unassigned
                    </Badge>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-6 px-2 ml-1"
                    onClick={() => setIsSelecting(true)}
                    disabled={isAssigning}
                  >
                    {isAssigning ? "..." : "Change"}
                  </Button>
                </>
              )}
            </div>
            
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
