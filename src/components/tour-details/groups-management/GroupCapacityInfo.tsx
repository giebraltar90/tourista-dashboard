
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
  // Ensure tour.tourGroups exists and is an array
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  console.log("PARTICIPANTS DEBUG: GroupCapacityInfo initial data:", {
    tourId: tour.id,
    isHighSeason,
    groupsCount: tourGroups.length,
    providedTotalParticipants
  });
  
  // CRITICAL: Log raw group data for debugging
  console.log("PARTICIPANTS DEBUG: GroupCapacityInfo raw tour groups:", 
    tourGroups.map(g => ({
      id: g.id,
      name: g.name || 'Unnamed',
      size: g.size,
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
  
  // ULTRA BUGFIX: Complete fresh recalculation of all participant counts
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // CRITICAL FIX: Only count from participants arrays, never fallback to size property
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      let groupTotal = 0;
      let groupChildCount = 0;
      
      console.log(`PARTICIPANTS DEBUG: Processing group "${group.name || 'Unnamed'}" participants:`, 
        Array.isArray(group.participants) 
          ? group.participants.map(p => ({ 
              id: p.id,
              name: p.name, 
              count: p.count || 1, 
              childCount: p.childCount || 0 
            }))
          : 'No participants array'
      );
      
      // Count directly from participants array
      for (const participant of group.participants) {
        const count = participant.count || 1;
        const childCount = participant.childCount || 0;
        
        groupTotal += count;
        groupChildCount += childCount;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant "${participant.name}" to group "${group.name || 'Unnamed'}":`, {
          count,
          childCount,
          groupRunningTotal: groupTotal,
          groupRunningChildCount: groupChildCount
        });
      }
      
      calculatedTotalParticipants += groupTotal;
      calculatedTotalChildCount += groupChildCount;
      
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" totals:`, {
        groupId: group.id,
        groupTotal,
        groupChildCount,
        overallRunningTotal: calculatedTotalParticipants,
        overallRunningChildCount: calculatedTotalChildCount
      });
    } else {
      console.log(`PARTICIPANTS DEBUG: Group "${group.name || 'Unnamed'}" has no participants array`);
    }
    // CRITICAL FIX: Remove fallback to size properties completely
  }
  
  // Use calculated values, only fall back to provided values if calculation yields 0
  const displayedParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : (providedTotalParticipants || 0);
  const childCount = calculatedTotalChildCount > 0 ? calculatedTotalChildCount : 0;
  const adultCount = displayedParticipants - childCount;
  
  // Format participant count to show adults + children
  const formattedParticipantCount = formatParticipantCount(displayedParticipants, childCount);
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  // Ultra detailed logging of final calculations
  console.log("PARTICIPANTS DEBUG: GroupCapacityInfo final calculations:", {
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
