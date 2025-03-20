
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
  
  // CRITICAL FIX: Calculate directly from the participants arrays of each group
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // Detailed calculation loop for reliability
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      for (const participant of group.participants) {
        calculatedTotalParticipants += participant.count || 1;
        calculatedTotalChildCount += participant.childCount || 0;
      }
    } else {
      // Fallback to group properties when participants array isn't available
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
  console.log("COUNTING: GroupCapacityInfo direct calculation results:", {
    calculatedTotalParticipants,
    calculatedTotalChildCount,
    providedTotalParticipants,
    displayedParticipants,
    adultCount,
    childCount,
    formattedParticipantCount,
    isHighSeason,
    capacity,
    requiredGroups,
    tourGroupsCount: tourGroups.length,
    groupDetails: tourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount,
      directParticipantCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
        : 'No participants array',
      directChildCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.childCount || 0), 0) 
        : 'No participants array',
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 'N/A',
      participantDetails: Array.isArray(g.participants) 
        ? g.participants.map(p => ({ name: p.name, count: p.count || 1, childCount: p.childCount || 0 }))
        : 'No participant details available'
    }))
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
