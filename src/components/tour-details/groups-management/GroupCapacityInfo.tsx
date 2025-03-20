
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
  
  // ULTRA BUGFIX: Calculate directly from the participants arrays with ultra detailed logging
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  console.log("ULTRA DEBUG: GroupCapacityInfo calculating with tour groups:", {
    groupsCount: tourGroups.length,
    isHighSeason,
    tourId: tour.id
  });
  
  // Special debug for raw group data
  console.log("ULTRA DEBUG: Raw tour groups data:", tourGroups.map(g => ({
    id: g.id,
    name: g.name,
    size: g.size,
    childCount: g.childCount,
    hasParticipants: Array.isArray(g.participants),
    participantsCount: Array.isArray(g.participants) ? g.participants.length : 0
  })));
  
  // Detailed calculation loop for reliability - directly count each participant
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      // Log each participant individually for clarity
      console.log(`ULTRA DEBUG: Group "${group.name}" participant details:`, 
        group.participants.map(p => ({ 
          name: p.name, 
          count: p.count, 
          childCount: p.childCount 
        }))
      );
      
      // Count directly from participants array
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupTotal += count;
        groupChildCount += childCount;
        
        console.log(`ULTRA DEBUG: Adding participant "${participant.name}": count=${count}, childCount=${childCount}`);
      }
      
      calculatedTotalParticipants += groupTotal;
      calculatedTotalChildCount += groupChildCount;
      
      console.log(`ULTRA DEBUG: GroupCapacityInfo group "${group.name || 'unnamed'}" final calculation:`, {
        groupId: group.id,
        groupName: group.name,
        groupParticipantCount: group.participants.length,
        groupTotal,
        groupChildCount
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`ULTRA DEBUG: GroupCapacityInfo no participants for group ${group.name || 'unnamed'}, using size:`, {
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
  
  // Ultra detailed logging for debugging
  console.log("ULTRA DEBUG: GroupCapacityInfo final calculations:", {
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
