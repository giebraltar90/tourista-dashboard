
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { ParticipantItem } from "./ParticipantItem";
import { ParticipantDropZone } from "./ParticipantDropZone";
import { useState, useEffect } from "react";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, groupIndex: number) => void;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onDragEnd: (e?: React.DragEvent) => void;
  onMoveClick: (data: { participant: VentrataParticipant; fromGroupIndex: number }) => void;
  selectedParticipant: { participant: VentrataParticipant; fromGroupIndex: number } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isMovePending: boolean;
  onRefreshParticipants?: () => void;
  onAssignGuide?: (groupIndex: number) => void;
}

export const GroupCard = ({
  group,
  groupIndex,
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending,
  onRefreshParticipants,
  onAssignGuide
}: GroupCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);

  console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] initial render:`, {
    groupId: group.id,
    groupName: group.name || `Group ${groupIndex + 1}`,
    hasParticipantsArray: Array.isArray(group.participants),
    participantsLength: Array.isArray(group.participants) ? group.participants.length : 0,
    guideName
  });

  useEffect(() => {
    console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] updating participants:`, {
      groupId: group.id,
      groupName: group.name || `Group ${groupIndex + 1}`,
      hasParticipantsArray: Array.isArray(group.participants),
      participantsLength: Array.isArray(group.participants) ? group.participants.length : 0,
      rawParticipants: Array.isArray(group.participants) 
        ? group.participants.map(p => ({
            id: p.id,
            name: p.name, 
            count: p.count || 1, 
            childCount: p.childCount || 0
          })) 
        : []
    });
    
    if (Array.isArray(group.participants)) {
      setLocalParticipants(group.participants);
    } else {
      // Ensure we always have an array, even if empty
      setLocalParticipants([]);
    }
  }, [group.participants, groupIndex, group.id, group.name]);

  // Force refresh when needed to repopulate the participants list
  useEffect(() => {
    if (localParticipants.length === 0 && group.size > 0 && onRefreshParticipants) {
      console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] has participants mismatch, triggering refresh.`);
      onRefreshParticipants();
    }
  }, [localParticipants.length, group.size, groupIndex, onRefreshParticipants]);

  const handleRefreshParticipants = () => {
    if (onRefreshParticipants) {
      setIsRefreshing(true);
      onRefreshParticipants();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // CRUCIAL FIX: Calculate directly from localParticipants array, ignore group.size completely
  let totalParticipants = 0;
  let childCount = 0;
  
  if (Array.isArray(localParticipants) && localParticipants.length > 0) {
    console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] counting from ${localParticipants.length} participants`);
    
    for (const participant of localParticipants) {
      const count = participant.count || 1;
      const childCt = participant.childCount || 0;
      
      totalParticipants += count;
      childCount += childCt;
      
      console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] adding participant "${participant.name}":`, {
        count,
        childCount: childCt,
        runningTotal: totalParticipants,
        runningChildCount: childCount
      });
    }
  } else {
    console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] has no participants, using group size`);
    // Group has no participants, use group size
    totalParticipants = group.size || 0;
    childCount = group.childCount || 0;
  }
  
  const adultCount = totalParticipants - childCount;
  
  const displayParticipants = formatParticipantCount(totalParticipants, childCount);

  console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] final counts:`, {
    groupId: group.id,
    groupName: group.name || `Group ${groupIndex + 1}`,
    totalParticipants,
    childCount,
    adultCount,
    displayParticipants,
    participantsCount: localParticipants.length
  });

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <h3 className="text-base font-medium">{group.name || `Group ${groupIndex + 1}`}</h3>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                totalParticipants >= 15 
                  ? "bg-red-100 text-red-800" 
                  : totalParticipants >= 10 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-green-100 text-green-800"
              }`}
            >
              {displayParticipants}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefreshParticipants}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh participants</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? "Collapse" : "Expand"}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pb-3 pt-0">
          <div className="space-y-2">
            <div
              className="min-h-[100px] rounded-md"
              data-drop-target="true"
              onDragOver={(e) => onDragOver(e)}
              onDragLeave={(e) => onDragLeave && onDragLeave(e)}
              onDrop={(e) => onDrop(e, groupIndex)}
            >
              {Array.isArray(localParticipants) && localParticipants.length > 0 ? (
                <div className="space-y-1">
                  {localParticipants.map((participant, idx) => (
                    <ParticipantItem
                      key={`${participant.id}-${idx}`}
                      participant={participant}
                      onDragStart={(e) => onDragStart(e, participant, groupIndex)}
                      onDragEnd={onDragEnd}
                      onMoveClick={() => onMoveClick({ participant, fromGroupIndex: groupIndex })}
                      isDragging={
                        selectedParticipant?.participant?.id === participant.id &&
                        selectedParticipant?.fromGroupIndex === groupIndex
                      }
                      disabled={isMovePending}
                    />
                  ))}
                </div>
              ) : (
                <ParticipantDropZone groupIndex={groupIndex}>
                  {totalParticipants > 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      This group has {totalParticipants} participants but data isn't loaded.
                      <br />
                      Click refresh above to load participants.
                    </p>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Drop participants here
                    </p>
                  )}
                </ParticipantDropZone>
              )}
            </div>
            
            {selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex && (
              <div className="mt-2">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleMoveParticipant(groupIndex)}
                  disabled={isMovePending}
                >
                  {isMovePending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Moving...
                    </>
                  ) : (
                    <>Move to this group</>
                  )}
                </Button>
              </div>
            )}
            
            {onAssignGuide && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onAssignGuide(groupIndex)}
                >
                  {guideName ? `Change Guide (${guideName})` : "Assign Guide"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
