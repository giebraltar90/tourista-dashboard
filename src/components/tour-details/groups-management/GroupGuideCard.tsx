
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { VentrataTourGroup } from "@/types/ventrata";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

interface GroupGuideCardProps {
  index: number;
  group: VentrataTourGroup;
  guideName: string;
  guideInfo: any;
  onAssignGuide: (index: number) => void;
}

export const GroupGuideCard = ({ 
  index, 
  group, 
  guideName, 
  guideInfo,
  onAssignGuide 
}: GroupGuideCardProps) => {
  const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
  
  // Calculate the correct participant count
  const totalParticipants = group.size || 0;
  
  // Log the guide assignment for debugging
  useEffect(() => {
    logger.debug(`GroupGuideCard[${index}]: Guide assignment info:`, {
      groupId: group.id,
      groupIndex: index,
      groupName: group.name || `Group ${index + 1}`,
      guideId: group.guideId || 'unassigned',
      guideName: guideName || 'Unassigned',
      guideType: guideInfo?.guideType || 'unknown',
      totalParticipants
    });
  }, [index, group.id, group.guideId, guideName, guideInfo, group.name, totalParticipants]);
  
  return (
    <div key={index} className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{group.name || `Group ${index + 1}`}</h4>
        <Badge variant="outline" className="bg-blue-50">
          {totalParticipants} participants
        </Badge>
      </div>
      
      <div className="flex items-center mt-2">
        <div className={`p-2 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isGuideAssigned ? <Users className="h-4 w-4 text-green-600" /> : <UserPlus className="h-4 w-4 text-gray-400" />}
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
          onClick={() => onAssignGuide(index)}
        >
          {isGuideAssigned ? "Change Guide" : "Assign Guide"}
        </Button>
      </div>
    </div>
  );
};
