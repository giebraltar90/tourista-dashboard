
import { TourCardProps } from "./types";
import { GuideInfo } from "@/types/ventrata";
import { findGuideName } from "@/hooks/group-management/services/utils/guideNameUtils";
import { useGuideData } from "@/hooks/guides/useGuideData";

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
  const { guides = [] } = useGuideData() || { guides: [] };
  
  // CRITICAL IMPROVED LOGGING: Log each participant in each group meticulously
  console.log("PARTICIPANTS DEBUG: TourCardDetails processing tourGroups:", 
    tourGroups?.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      groupSize: g.size,
      childCount: g.childCount,
      hasParticipantsArray: Array.isArray(g.participants),
      participantsLength: Array.isArray(g.participants) ? g.participants.length : 0,
      participants: Array.isArray(g.participants) ? g.participants.map(p => ({
        id: p.id,
        name: p.name,
        count: p.count || 1,
        childCount: p.childCount || 0
      })) : []
    }))
  );
  
  // ULTRA BUGFIX: Completely fresh recalculation of participants from scratch
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // CRITICAL FIX: Only count from participants arrays, never fallback to group.size
  if (Array.isArray(tourGroups)) {
    for (const group of tourGroups) {
      if (Array.isArray(group.participants) && group.participants.length > 0) {
        // Count directly from participants array - one by one
        for (const participant of group.participants) {
          calculatedTotalParticipants += participant.count || 1;
          calculatedTotalChildCount += participant.childCount || 0;
          
          console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" to count:`, {
            participantCount: participant.count || 1,
            childCount: participant.childCount || 0,
            runningTotal: calculatedTotalParticipants,
            runningChildCount: calculatedTotalChildCount
          });
        }
      }
      // Completely remove fallback to group.size 
    }
  }
  
  // Use calculated value or fall back to provided value only if calculation is 0
  const actualTotalParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : totalParticipants;
  
  // Get the actual guides assigned to the groups
  const getAssignedGuideNames = () => {
    const assignedGuideIds = (tourGroups || [])
      .filter(group => group.guideId)
      .map(group => group.guideId);
      
    // Remove duplicates
    const uniqueGuideIds = [...new Set(assignedGuideIds)];
    
    // Map guide IDs to guide names using findGuideName
    return uniqueGuideIds.map(guideId => {
      // Create a simplified tour object with just the guides we need
      const tourObj = {
        guide1,
        guide2,
      };
      
      // Use the utility function to find the proper name
      return findGuideName(guideId, tourObj, guides);
    });
  };
  
  // Get the actual guide names assigned to the groups
  const assignedGuideNames = getAssignedGuideNames();
  
  // Format participant count to show adults + children
  const formattedParticipantCount = calculatedTotalChildCount > 0 
    ? `${calculatedTotalParticipants - calculatedTotalChildCount}+${calculatedTotalChildCount}` 
    : actualTotalParticipants;
  
  // Get the actual capacity based on the high season flag
  const capacity = isHighSeason ? 36 : 24;
  
  console.log("PARTICIPANTS DEBUG: TourCardDetails final calculation:", {
    calculatedTotalParticipants,
    calculatedTotalChildCount,
    formattedParticipantCount,
    capacity,
    tourGroups: tourGroups?.length || 0
  });
  
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{location}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Groups:</span>
          <span className="font-medium">{tourGroups?.length || 0}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Guides:</span>
          <span className="font-medium">
            {assignedGuideNames.length > 0 
              ? assignedGuideNames.join(" / ")
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
