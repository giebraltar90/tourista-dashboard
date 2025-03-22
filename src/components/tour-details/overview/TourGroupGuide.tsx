
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
  const { assignGuide } = useAssignGuide(tour);
  
  // Critical debug output to track data coming in
  console.log(`TourGroupGuide(${groupIndex}) rendering with:`, {
    groupId: group.id,
    groupName: group.name || `Group ${groupIndex + 1}`,
    hasParticipantsArray: Array.isArray(group.participants),
    participantsLength: Array.isArray(group.participants) ? group.participants.length : 0,
    sizeProp: group.size,
    childCountProp: group.childCount,
    rawGroup: group
  });
  
  // Calculate participant count directly from participants array if available
  let participantCount = 0;
  let childCount = 0;
  
  if (Array.isArray(group.participants) && group.participants.length > 0) {
    // Count from participants array
    participantCount = group.participants.reduce((sum, p) => {
      const count = typeof p.count === 'number' ? p.count : (p.count ? parseInt(String(p.count)) : 1);
      return sum + count;
    }, 0);
    
    childCount = group.participants.reduce((sum, p) => {
      const childCount = typeof p.childCount === 'number' ? p.childCount : (p.childCount ? parseInt(String(p.childCount)) : 0);
      return sum + childCount;
    }, 0);
    
    console.log(`TourGroupGuide(${groupIndex}) calculated from participants:`, {
      participantCount,
      childCount
    });
  } else if (typeof group.size === 'number' && group.size > 0) {
    // Fallback to size property if it's a number
    participantCount = group.size;
    childCount = typeof group.childCount === 'number' ? group.childCount : 0;
    
    console.log(`TourGroupGuide(${groupIndex}) using size property:`, {
      participantCount,
      childCount
    });
  } else {
    // Final fallback - parse from strings if needed
    try {
      participantCount = group.size ? parseInt(String(group.size)) : 0;
      childCount = group.childCount ? parseInt(String(group.childCount)) : 0;
      
      console.log(`TourGroupGuide(${groupIndex}) parsed from strings:`, {
        participantCount,
        childCount
      });
    } catch (e) {
      console.error(`TourGroupGuide(${groupIndex}) error parsing size:`, e);
      participantCount = 0;
      childCount = 0;
    }
  }
  
  // Ensure we have valid non-negative numbers
  participantCount = Math.max(0, participantCount);
  childCount = Math.max(0, childCount);
  
  // Calculate adult count (total minus children)
  const adultCount = Math.max(0, participantCount - childCount);
  
  // Format participant count to show adults + children if there are children
  const displayParticipants = formatParticipantCount(participantCount, childCount);
  
  console.log(`TourGroupGuide(${groupIndex}) final display values:`, {
    participantCount,
    childCount,
    adultCount,
    displayParticipants
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
