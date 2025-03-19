import { TourCardProps } from "@/components/tours/tour-card/types";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

interface GroupCapacityInfoProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  totalParticipants: number;
}

export const GroupCapacityInfo = ({ 
  tour, 
  isHighSeason, 
  totalParticipants 
}: GroupCapacityInfoProps) => {
  // Ensure tour.tourGroups exists and recalculate totals from the source of truth
  const tourGroups = tour.tourGroups || [];
  
  // Calculate counts directly from tour groups to ensure accuracy
  const actualTotalParticipants = tourGroups.reduce((sum, group) => {
    // Calculate from participants array if available for maximum accuracy
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((pSum, p) => pSum + (p.count || 1), 0);
    }
    // Otherwise use the group size
    return sum + (group.size || 0);
  }, 0);
  
  // Use the most accurate count available
  const displayedParticipants = actualTotalParticipants || totalParticipants;
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  // Log for debugging synchronization issues
  console.log("GroupCapacityInfo rendering with counts:", {
    actualTotalParticipants,
    providedTotalParticipants: totalParticipants,
    groupSizes: tourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount,
      participantsCount: Array.isArray(g.participants) 
        ? g.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
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
              {displayedParticipants} / {capacity}
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
