
import { TourCardProps } from "./types";
import { GuideInfo } from "@/types/ventrata";
import { findGuideName } from "@/hooks/group-management/services/utils/guideNameUtils";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

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
          // Count directly from participants array
          for (const participant of group.participants) {
            const count = participant.count || 1;
            const childCount = participant.childCount || 0;
            
            calculatedTotalParticipants += count;
            calculatedTotalChildCount += childCount;
          }
        } else if (group.size > 0) {
          // Use size value as fallback if no participants array
          calculatedTotalParticipants += group.size;
          calculatedTotalChildCount += group.childCount || 0;
        }
      }
    }
    
    // If calculated value is 0, fall back to provided value
    const finalTotalParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : totalParticipants;
    
    return {
      totalParticipants: finalTotalParticipants,
      childCount: calculatedTotalChildCount,
      adultCount: finalTotalParticipants - calculatedTotalChildCount
    };
  })();
  
  // Get the actual guides assigned to the groups
  const getAssignedGuideNames = () => {
    // Start with the primary guides if they exist
    const guideNames = [];
    if (guide1) guideNames.push(guide1);
    if (guide2) guideNames.push(guide2);
    
    // If we have group-assigned guides, add those too
    const groupGuideNames = (tourGroups || [])
      .filter(group => group.guideName)
      .map(group => group.guideName)
      .filter(name => name && !guideNames.includes(name)); // Only unique names not already in list
      
    // Add unique group guide names
    guideNames.push(...groupGuideNames);
    
    // Return joined guide names or default text
    return guideNames.length > 0 
      ? guideNames.join(" / ")
      : "No guides assigned";
  };
  
  // Format participant count to show adults+children
  const formattedParticipants = formatParticipantCount(
    participantCounts.totalParticipants, 
    participantCounts.childCount
  );
  
  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{location || "Not specified"}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Groups:</span>
          <span className="font-medium">{tourGroups?.length || 0}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Guides:</span>
          <span className="font-medium">{getAssignedGuideNames()}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm">
          <span className="text-muted-foreground">Participants:</span>
          <span className="font-medium">{formattedParticipants}</span>
        </div>
      </div>
    </div>
  );
};
