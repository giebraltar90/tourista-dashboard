
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
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

  // Get guide info for this group
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);

  // Update localParticipants when group.participants changes
  useEffect(() => {
    console.log(`GroupCard[${groupIndex}] participants from props:`, group.participants);
    if (Array.isArray(group.participants)) {
      setLocalParticipants(group.participants);
    } else {
      setLocalParticipants([]);
    }
  }, [group.participants, groupIndex]);

  // Handle refresh participants
  const handleRefreshParticipants = () => {
    if (onRefreshParticipants) {
      setIsRefreshing(true);
      onRefreshParticipants();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  // CRITICAL FIX: Calculate accurate counts directly from participants array when available
  const totalParticipantCount = Array.isArray(localParticipants) && localParticipants.length > 0
    ? localParticipants.reduce((sum, p) => sum + (p.count || 1), 0)
    : group.size || 0;
    
  const childCount = Array.isArray(localParticipants) && localParticipants.length > 0
    ? localParticipants.reduce((sum, p) => sum + (p.childCount || 0), 0)
    : group.childCount || 0;
  
  // Calculate adult count
  const adultCount = totalParticipantCount - childCount;
  
  // Format participant count to show adults + children if there are children
  const displayParticipants = childCount > 0 
    ? `${adultCount}+${childCount}` 
    : totalParticipantCount.toString();

  // Log accurate counts
  console.log(`GroupCard[${groupIndex}] accurate counts:`, {
    totalParticipantCount,
    childCount,
    adultCount,
    displayParticipants,
    participantsArray: Array.isArray(localParticipants) ? localParticipants.length : 'N/A'
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
                totalParticipantCount >= 15 
                  ? "bg-red-100 text-red-800" 
                  : totalParticipantCount >= 10 
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
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">
              {displayParticipants}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center">
            Guide: {guideName ? (
              <span className="ml-1 font-medium">{guideName}</span>
            ) : (
              <span className="ml-1 italic">None</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pb-3 pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center">
                <UserPlus className="mr-1 h-4 w-4" /> 
                Participants ({localParticipants.length})
              </h4>
              
              {onAssignGuide && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssignGuide(groupIndex)}
                >
                  Assign Guide
                </Button>
              )}
            </div>
            
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
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Drop participants here
                  </p>
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
          </div>
        </CardContent>
      )}
    </Card>
  );
};
