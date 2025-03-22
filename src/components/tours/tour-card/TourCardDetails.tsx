
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
    console.log("PARTICIPANTS DEBUG: TourCardDetails calculating counts");
    
    let calculatedTotalParticipants = 0;
    let calculatedTotalChildCount = 0;
    
    // Only process if tourGroups is an array
    if (Array.isArray(tourGroups)) {
      console.log("PARTICIPANTS DEBUG: Processing tourGroups:", tourGroups.map(g => ({
        id: g.id,
        name: g.name || 'Unnamed',
        size: g.size,
        childCount: g.childCount,
        hasParticipantsArray: Array.isArray(g.participants),
        participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
      })));
      
      for (const group of tourGroups) {
        if (Array.isArray(group.participants) && group.participants.length > 0) {
          console.log(`PARTICIPANTS DEBUG: Processing ${group.participants.length} participants in group ${group.name || 'Unnamed'}`);
          
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
          
          console.log(`PARTICIPANTS DEBUG: Using size fallback for group ${group.name || 'Unnamed'}:`, {
            size: group.size,
            childCount: group.childCount || 0,
            runningTotal: calculatedTotalParticipants,
            runningChildCount: calculatedTotalChildCount
          });
        }
      }
    }
    
    // If calculated value is 0, fall back to provided value
    const finalTotalParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : totalParticipants;
    
    console.log("PARTICIPANTS DEBUG: TourCardDetails final calculation:", {
      calculatedTotalParticipants,
      calculatedTotalChildCount,
      providedTotalParticipants: totalParticipants,
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
    
    console.log("PARTICIPANTS DEBUG: Unique guide IDs:", uniqueGuideIds);
    
    // Map guide IDs to guide names using findGuideName
    return uniqueGuideIds.map(guideId => {
      // Create a simplified tour object with just the guides we need
      const tourObj = {
        guide1,
        guide2,
      };
      
      // Use the utility function to find the proper name
      const guideName = findGuideName(guideId, tourObj, guides);
      console.log(`PARTICIPANTS DEBUG: Resolved guide ${guideId} to name "${guideName}"`);
      return guideName;
    });
  };
  
  // Get the actual guide names assigned to the groups
  const assignedGuideNames = getAssignedGuideNames();
  
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
          <span className="font-medium">{formattedParticipants}</span>
        </div>
      </div>
    </div>
  );
};
