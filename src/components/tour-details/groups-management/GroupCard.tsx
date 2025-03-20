
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onDrop?: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
  onMoveClick?: (data: { participant: VentrataParticipant, fromGroupIndex: number }) => void;
  selectedParticipant?: { participant: VentrataParticipant, fromGroupIndex: number } | null;
  handleMoveParticipant?: (toGroupIndex: number) => void;
  isMovePending?: boolean;
  onAssignGuide?: (index: number) => void;
}

export const GroupCard = ({ 
  group,
  groupIndex,
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
}: GroupCardProps) => {
  // Determine guide info based on guideId
  let guideName = "Unassigned";
  let guideInfo: GuideInfo | null = null;
  
  if (group.guideId === "guide1" && tour.guide1) {
    guideName = tour.guide1;
    guideInfo = guide1Info;
  } else if (group.guideId === "guide2" && tour.guide2) {
    guideName = tour.guide2;
    guideInfo = guide2Info;
  } else if (group.guideId === "guide3" && tour.guide3) {
    guideName = tour.guide3;
    guideInfo = guide3Info;
  }
  
  const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
  
  // Calculate the correct participant count
  const totalParticipants = group.size || 0;
  const childCount = group.childCount || 0;
  
  // Format participant count to show adults + children
  const formattedParticipantCount = childCount > 0 
    ? `${totalParticipants - childCount}+${childCount}` 
    : `${totalParticipants}`;
  
  return (
    <div 
      className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
      onDrop={onDrop ? (e) => onDrop(e, groupIndex) : undefined}
      onDragOver={onDragOver}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Group {groupIndex + 1}</h4>
        <Badge variant="outline" className="bg-blue-50">
          {formattedParticipantCount} {totalParticipants === 1 ? 'participant' : 'participants'}
        </Badge>
      </div>
      
      <div className="flex items-center mt-2">
        <div className={`p-2 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isGuideAssigned ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserPlus className="h-4 w-4 text-gray-400" />}
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm">
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
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onAssignGuide && onAssignGuide(groupIndex)}
        >
          {isGuideAssigned ? "Change Guide" : "Assign Guide"}
        </Button>
      </div>
      
      {/* If this is being used in participant management, display participants */}
      {group.participants && group.participants.length > 0 && onDragStart && (
        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium">Participants</h5>
          <div className="space-y-1">
            {group.participants.map((participant, index) => (
              <div 
                key={participant.id || index}
                draggable
                onDragStart={(e) => onDragStart(e, participant, groupIndex)}
                className="p-2 bg-white rounded border border-gray-100 text-sm flex justify-between items-center cursor-move"
                onClick={() => onMoveClick && onMoveClick({ participant, fromGroupIndex: groupIndex })}
              >
                <span>{participant.name} ({participant.count})</span>
                <Badge variant="outline" className="text-xs">
                  {participant.bookingRef}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show move here button if a participant is selected */}
      {selectedParticipant && selectedParticipant.fromGroupIndex !== groupIndex && handleMoveParticipant && (
        <Button 
          className="w-full mt-4" 
          size="sm"
          variant="secondary"
          onClick={() => handleMoveParticipant(groupIndex)}
          disabled={isMovePending}
        >
          Move to Group {groupIndex + 1}
        </Button>
      )}
    </div>
  );
};
