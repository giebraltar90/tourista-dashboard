
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideBadge } from "./GuideBadge";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { AssignGuideButton } from "./AssignGuideButton";
import { User, Users } from "lucide-react";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

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
  const { assignGuide } = useAssignGuide(tour.id);
  
  // Calculate participant count directly from participants array if available
  const participantCount = Array.isArray(group.participants) && group.participants.length > 0
    ? group.participants.reduce((sum, p) => sum + (p.count || 1), 0)
    : group.size || 0;
    
  // Calculate child count from participants array if available  
  const childCount = Array.isArray(group.participants) && group.participants.length > 0
    ? group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0)
    : group.childCount || 0;
  
  // Calculate adult count (total minus children)
  const adultCount = participantCount - childCount;
  
  // Format participant count to show adults + children if there are children
  const displayParticipants = formatParticipantCount(participantCount, childCount);
  
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
                <GuideBadge 
                  guideName={guideName} 
                  guideInfo={guideInfo} 
                  isAssigned={!!guideName} 
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No guide assigned</span>
            )}
          </div>
          <AssignGuideButton 
            tourId={tour.id}
            guideId={group.guideId || ""}
            guideName={guideName}
            groupIndex={groupIndex}
            guides={guideOptions}
            displayName={group.name || `Group ${groupIndex + 1}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
