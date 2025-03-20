
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup, VentrataParticipant, GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";

interface GroupCardProps {
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  onAssignGuide?: (index: number) => void;
  // Adding missing props that are passed from GroupsGrid
  onDrop?: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
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
  onDragStart,
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isMovePending
}: GroupCardProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
  
  const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
  
  // Log detailed guide info for debugging
  console.log(`Group ${groupIndex} guide info:`, { 
    groupName: group.name, 
    groupId: group.id,
    guideId: group.guideId, 
    assignedGuideName: guideName,
    guideInfo: guideInfo ? `Found: ${!!guideInfo}` : 'None',
    originalGuideData: group.guideId ? `Found: ${!!tour.tourGroups[groupIndex].guideId}` : 'None'
  });

  return (
    <Card className={`${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
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
      </CardContent>
    </Card>
  );
};
