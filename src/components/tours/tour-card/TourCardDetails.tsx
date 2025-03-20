
import { TourCardProps } from "./types";
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { findGuideName } from "@/hooks/group-management/services/utils/guideNameUtils";

interface TourCardDetailsProps {
  guide1: string;
  guide2: string;
  guide1Info?: GuideInfo;
  guide2Info?: GuideInfo;
  location: string;
  tourGroups: TourCardProps['tourGroups'];
  totalParticipants: number;
  isHighSeason: boolean;
}

export const TourCardDetails = ({ 
  guide1, 
  guide2, 
  guide1Info, 
  guide2Info, 
  location, 
  tourGroups,
  totalParticipants,
  isHighSeason
}: TourCardDetailsProps) => {
  // Use the actual assigned guides from tour groups instead of primary guides
  const getAssignedGuides = () => {
    const assignedGuideIds = tourGroups
      .filter(group => group.guideId)
      .map(group => group.guideId);
      
    // Remove duplicates
    const uniqueGuideIds = [...new Set(assignedGuideIds)];
    
    // Map guide IDs to guide names or IDs
    return uniqueGuideIds.map(guideId => {
      if (guideId === "guide1") return guide1;
      if (guideId === "guide2") return guide2;
      
      // For UUIDs or other guide IDs, just show a shortened version or placeholder
      if (isValidUuid(guideId)) {
        return `Guide (${guideId.substring(0, 6)}...)`;
      }
      
      return guideId || "Unassigned";
    });
  };
  
  // Get the actual guides assigned to the groups
  const assignedGuides = getAssignedGuides();
  
  // No need for these lines since we're getting the actual assigned guides
  // const formattedGuide1 = guide1 || "No Guide";
  // const formattedGuide2 = guide2 ? ` / ${guide2}` : "";
  
  // Format participant count to show adults + children
  const totalChildCount = tourGroups.reduce((sum, group) => sum + (group.childCount || 0), 0);
  const formattedParticipantCount = totalChildCount > 0 
    ? `${totalParticipants - totalChildCount}+${totalChildCount}` 
    : totalParticipants;
  
  // Get the actual capacity based on the high season flag
  const capacity = isHighSeason ? 36 : 24;
  
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{location}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Groups:</span>
          <span className="font-medium">{tourGroups.length}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Guides:</span>
          <span className="font-medium">
            {assignedGuides.length > 0 
              ? assignedGuides.join(" / ")
              : "No guides assigned"}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Participants:</span>
          <span className="font-medium">{formattedParticipantCount}</span>
        </div>
      </div>
    </div>
  );
};
