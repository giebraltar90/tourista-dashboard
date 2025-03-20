
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { ParticipantItem } from "./ParticipantItem";
import { ParticipantDropZone } from "./ParticipantDropZone";
import { useState, useEffect } from "react";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onAssignGuide?: (index: number) => void;
  // Adding props for participant management
  onDrop?: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onMoveClick?: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
  selectedParticipant?: { participant: VentrataParticipant, fromGroupIndex: number } | null;
  handleMoveParticipant?: (toGroupIndex: number) => void;
  isMovePending?: boolean;
}

export const GroupCard = ({
  group,
  groupIndex,
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  onAssignGuide,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragStart,
  onDragEnd,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending
}: GroupCardProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
  const [showParticipants, setShowParticipants] = useState(true);
  
  const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
  
  // Ensure participants is always an array
  const [participants, setParticipants] = useState<VentrataParticipant[]>([]);
  
  // Debug: Log what's received for this group
  console.log(`GroupCard[${groupIndex}] rendering with group:`, group);
  console.log(`GroupCard[${groupIndex}] participants from props:`, group.participants);
  
  // Update participants when group changes
  useEffect(() => {
    // Normalize participants to always be an array
    const normalizedParticipants = Array.isArray(group.participants) ? group.participants : [];
    
    // Log what we're setting
    console.log(`GroupCard[${groupIndex}] setting normalized participants:`, normalizedParticipants);
    
    setParticipants(normalizedParticipants);
  }, [group, groupIndex, group.participants]);

  // For move operations
  const isDropTarget = selectedParticipant !== null;
  const isMoveTarget = selectedParticipant !== null && selectedParticipant.fromGroupIndex !== groupIndex;

  return (
    <Card className={`${isGuideAssigned ? 'border-green-200 bg-green-50/50' : 'border-gray-200'} transition-all duration-300 hover:shadow-md`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">{group.name}</h3>
          <Badge variant="outline" className="bg-blue-50">
            {group.size} participants
          </Badge>
        </div>
        
        <div className="flex items-center mt-3">
          <div className={`p-2 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
            {isGuideAssigned ? <Users className="h-4 w-4 text-green-600" /> : <UserPlus className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm">
              Guide: {isGuideAssigned ? (
                <span className="ml-1">
                  <Badge className="bg-green-100 text-green-800">
                    {guideName}
                  </Badge>
                  {guideInfo?.guideType && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({guideInfo.guideType})
                    </span>
                  )}
                </span>
              ) : (
                <Badge className="ml-1 bg-yellow-100 text-yellow-800">
                  Unassigned
                </Badge>
              )}
            </p>
          </div>
          {onAssignGuide && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onAssignGuide(groupIndex)}
            >
              {isGuideAssigned ? "Change Guide" : "Assign Guide"}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Participant list section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-6 mr-1" 
                onClick={() => setShowParticipants(!showParticipants)}
              >
                {showParticipants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              Participants ({participants.length})
            </h4>
          </div>
          
          {showParticipants && (
            <ParticipantDropZone
              groupIndex={groupIndex}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              isDropTarget={isDropTarget}
              onMoveHere={handleMoveParticipant}
              isMoveTarget={isMoveTarget}
              isMovePending={isMovePending}
            >
              <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                {participants && participants.length > 0 ? (
                  participants.map((participant, idx) => (
                    <ParticipantItem
                      key={participant.id || `participant-${groupIndex}-${idx}`}
                      participant={participant}
                      groupIndex={groupIndex}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onMoveClick={onMoveClick}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-4 text-center italic border border-dashed border-gray-200 rounded-md">
                    No participants in this group
                  </div>
                )}
              </div>
            </ParticipantDropZone>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
