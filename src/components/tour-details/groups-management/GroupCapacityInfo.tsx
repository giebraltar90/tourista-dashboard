
import { TourCardProps } from "@/components/tours/tour-card/types";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

interface GroupCapacityInfoProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  totalParticipants?: number;
}

export const GroupCapacityInfo = ({ 
  tour, 
  isHighSeason, 
  totalParticipants: providedTotalParticipants 
}: GroupCapacityInfoProps) => {
  // Ensure tour.tourGroups exists
  const tourGroups = tour.tourGroups || [];
  
  // ENHANCED DEBUG: Log input data
  console.log("ENHANCED DEBUG: GroupCapacityInfo input data:", {
    providedTotalParticipants,
    isHighSeason,
    tourId: tour.id,
    groupsCount: tourGroups.length
  });
  
  // CRITICAL FIX: Calculate directly from the participants arrays of each group
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // Detailed calculation loop for reliability
  for (const group of tourGroups) {
    console.log(`ENHANCED DEBUG: Processing group ${group.name}:`, {
      id: group.id,
      size: group.size,
      childCount: group.childCount,
      hasParticipantsArray: Array.isArray(group.participants),
      participantsLength: Array.isArray(group.participants) ? group.participants.length : 0
    });
    
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Calculate from participants array for most accuracy
      let groupParticipantCount = 0;
      let groupChildCount = 0;
      
      for (const participant of group.participants) {
        const participantCount = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupParticipantCount += participantCount;
        groupChildCount += childCount;
      }
      
      console.log(`ENHANCED DEBUG: Group ${group.name} calculated from participants array:`, {
        participantCount: groupParticipantCount,
        childCount: groupChildCount,
        participantDetails: group.participants.map(p => ({ name: p.name, count: p.count || 1, childCount: p.childCount || 0 }))
      });
      
      calculatedTotalParticipants += groupParticipantCount;
      calculatedTotalChildCount += groupChildCount;
    } else {
      // Fallback to group properties when participants array isn't available
      console.log(`ENHANCED DEBUG: Group ${group.name} using size properties:`, {
        size: group.size || 0,
        childCount: group.childCount || 0
      });
      
      calculatedTotalParticipants += group.size || 0;
      calculatedTotalChildCount += group.childCount || 0;
    }
  }
  
  // Use calculated values, fall back to provided values if calculation fails
  const displayedParticipants = calculatedTotalParticipants || providedTotalParticipants || 0;
  const childCount = calculatedTotalChildCount || 0;
  const adultCount = displayedParticipants - childCount;
  
  // Format participant count to show adults + children
  const formattedParticipantCount = formatParticipantCount(displayedParticipants, childCount);
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  // Enhanced detailed logging for debugging
  console.log("ENHANCED DEBUG: GroupCapacityInfo final calculations:", {
    calculatedTotalParticipants,
    calculatedTotalChildCount,
    providedTotalParticipants,
    displayedParticipants,
    adultCount,
    childCount,
    formattedParticipantCount,
    isHighSeason,
    capacity,
    requiredGroups
  });
  
  return (
    <>
      <CardTitle>Current Capacity</CardTitle>
      <CardDescription>
        <div className="flex justify-between mt-4">
          <div>
            <span className="font-medium">Participants</span>
            <div className="text-xl font-bold">
              {formattedParticipantCount} / {capacity}
            </div>
          </div>
          <div>
            <span className="font-medium">Groups</span>
            <div className="text-xl font-bold">
              {tourGroups.length} / {requiredGroups}
            </div>
          </div>
        </div>
      </CardDescription>
    </>
  );
};
