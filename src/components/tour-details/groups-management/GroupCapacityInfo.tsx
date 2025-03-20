
import { TourCardProps } from "@/components/tours/tour-card/types";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

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
  
  // CRITICAL FIX: Calculate totals directly from participants arrays when available
  const actualTotalParticipants = tourGroups.reduce((total, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return total + group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
    }
    return total + (group.size || 0);
  }, 0);
  
  const actualTotalChildCount = tourGroups.reduce((total, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return total + group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0);
    }
    return total + (group.childCount || 0);
  }, 0);
  
  // Use the most accurate count available
  const displayedParticipants = actualTotalParticipants || providedTotalParticipants || 0;
  const adultCount = displayedParticipants - actualTotalChildCount;
  
  // Format participant count to show adults + children
  const formattedParticipantCount = actualTotalChildCount > 0 
    ? `${adultCount}+${actualTotalChildCount}` 
    : `${displayedParticipants}`;
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  // Log for debugging synchronization issues
  console.log("GroupCapacityInfo with fixed counting:", {
    actualTotalParticipants,
    actualTotalChildCount,
    adultCount,
    formattedParticipantCount,
    providedTotalParticipants,
    displayedParticipants,
    groupSizes: tourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount,
      participantsCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
        : 'N/A',
      childrenInParticipants: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.childCount || 0), 0) 
        : 'N/A'
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
