
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
  
  // Calculate total participants and child count only once
  const participantCounts = (() => {
    let calculatedTotalParticipants = 0;
    let calculatedTotalChildCount = 0;
    
    // Only process if tourGroups is an array
    if (Array.isArray(tourGroups)) {
      for (const group of tourGroups) {
        if (Array.isArray(group.participants) && group.participants.length > 0) {
          // Count directly from participants array - one by one
          for (const participant of group.participants) {
            calculatedTotalParticipants += participant.count || 1;
            calculatedTotalChildCount += participant.childCount || 0;
          }
        }
      }
    }
    
    // If calculated value is 0, fall back to provided value
    const finalTotalParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : totalParticipants;
    
    console.log("PARTICIPANTS DEBUG: TourCardDetails final calculation:", {
      calculatedTotalParticipants,
      calculatedTotalChildCount,
      finalTotalParticipants
    });
    
    return {
      totalParticipants: finalTotalParticipants,
      childCount: calculatedTotalChildCount,
      adultCount: finalTotalParticipants - calculatedTotalChildCount
    };
  })();
  
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
  const formattedParticipantCount = participantCounts.childCount > 0 
    ? `${participantCounts.adultCount}+${participantCounts.childCount}` 
    : participantCounts.totalParticipants.toString();
  
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
