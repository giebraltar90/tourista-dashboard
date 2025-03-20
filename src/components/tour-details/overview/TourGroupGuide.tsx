
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideBadge } from "./GuideBadge";
import { useAssignGuideToGroup } from "@/hooks/guides/useAssignGuideToGroup";
import { AssignGuideButton } from "./AssignGuideButton";
import { User, Users } from "lucide-react";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { calculateTotalParticipants } from "@/hooks/group-management/services/participantService";

interface TourGroupGuideProps {
  tour: TourCardProps;
  group: VentrataTourGroup;
  groupIndex: number;
  guideName: string;
  guideInfo: GuideInfo | null;
  guideOptions: any[];
}

export const TourGroupGuide = ({ 
  tour, 
  group, 
  groupIndex, 
  guideName, 
  guideInfo, 
  guideOptions 
}: TourGroupGuideProps) => {
  const { isAssigning, assignGuideToGroup } = useAssignGuideToGroup(tour.id);
  
  // Calculate participant count directly from participants array if available
  const participantCount = Array.isArray(group.participants) && group.participants.length > 0
    ? calculateTotalParticipants([group])
    : group.size || 0;
    
  // Calculate child count from participants array if available  
  const childCount = Array.isArray(group.participants) && group.participants.length > 0
    ? group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0)
    : group.childCount || 0;
  
  // Format participant count to show adults + children if there are children
  const displayParticipants = childCount > 0 
    ? `${participantCount - childCount}+${childCount}` 
    : participantCount.toString();
  
  console.log(`TourGroupGuide for ${group.name}:`, {
    participantCount,
    childCount,
    displayParticipants,
    hasParticipantsArray: Array.isArray(group.participants),
    participantsLength: Array.isArray(group.participants) ? group.participants.length : 'N/A'
  });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {group.name || `Group ${groupIndex + 1}`}
          </CardTitle>
          <div className="flex items-center bg-muted/50 px-2 py-1 rounded-md">
            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm font-medium">{displayParticipants}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Guide:</span>
            {guideName ? (
              <div className="flex-1">
                <GuideBadge name={guideName} guideInfo={guideInfo} />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No guide assigned</span>
            )}
          </div>
          <AssignGuideButton 
            group={group}
            guideOptions={guideOptions}
            isLoading={isAssigning}
            onAssign={(guideId) => assignGuideToGroup(group.id, guideId)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
