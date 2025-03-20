
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
  
  // MEGA BUGFIX: Calculate directly from the participants arrays of each group with detailed logging
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  console.log("MEGA DEBUG: GroupCapacityInfo calculating with tour groups:", {
    groupsCount: tourGroups.length,
    isHighSeason,
    tourId: tour.id
  });
  
  // Detailed calculation loop for reliability - directly count each participant
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      // Count directly from participants array
      for (const participant of group.participants) {
        groupTotal += participant.count || 1;
        groupChildCount += participant.childCount || 0;
      }
      
      calculatedTotalParticipants += groupTotal;
      calculatedTotalChildCount += groupChildCount;
      
      console.log(`MEGA DEBUG: GroupCapacityInfo group "${group.name || 'unnamed'}" detailed calculation:`, {
        groupId: group.id,
        groupName: group.name,
        groupParticipantCount: group.participants.length,
        groupTotal,
        groupChildCount,
        participants: group.participants.map(p => ({
          name: p.name, 
          count: p.count || 1, 
          childCount: p.childCount || 0
        }))
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`MEGA DEBUG: GroupCapacityInfo no participants for group ${group.name || 'unnamed'}, using size:`, {
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
  console.log("MEGA DEBUG: GroupCapacityInfo final calculations:", {
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
