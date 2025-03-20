
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
  
  // BUGFIX: Calculate directly from the participants arrays of each group
  let calculatedTotalParticipants = 0;
  let calculatedTotalChildCount = 0;
  
  // Detailed calculation loop for reliability - directly count each participant
  for (const group of tourGroups) {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      // Count directly from participants array
      for (const participant of group.participants) {
        calculatedTotalParticipants += participant.count || 1;
        calculatedTotalChildCount += participant.childCount || 0;
      }
      
      console.log(`BUGFIX: GroupCapacityInfo group ${group.name} calculated from participants:`, {
        directTotal: group.participants.reduce((sum, p) => sum + (p.count || 1), 0),
        directChildCount: group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0),
        participantsCount: group.participants.length
      });
    } else if (group.size) {
      // Only fallback to size properties when absolutely necessary
      console.log(`BUGFIX: GroupCapacityInfo no participants for group ${group.name}, using size:`, {
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
  console.log("BUGFIX: GroupCapacityInfo final calculations:", {
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
