
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
  // Calculate counts directly from tour groups to ensure accuracy
  const actualTotalParticipants = tour.tourGroups.reduce((sum, group) => {
    // Check if participants exists before trying to access it
    if (group.participants) {
      // Try to get count from participants first
      const participantCount = group.participants.reduce((pSum, p) => pSum + (p.count || 1), 0) || 0;
      // If participants exist but count is 0, fall back to group.size
      return sum + (participantCount > 0 ? participantCount : (group.size || 0));
    }
    // If no participants property, use group.size
    return sum + (group.size || 0);
  }, 0);
  
  // Use calculated participant count instead of passed-in value
  const displayedParticipants = actualTotalParticipants || totalParticipants;
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  return (
    <>
      <CardTitle>Current Capacity</CardTitle>
      <CardDescription>
        <div className="flex justify-between mt-4">
          <div>
            <span className="font-medium">People</span>
            <div className="text-xl font-bold">
              {displayedParticipants} / {capacity}
            </div>
          </div>
          <div>
            <span className="font-medium">Groups</span>
            <div className="text-xl font-bold">
              {tour.tourGroups.length} / {requiredGroups}
            </div>
          </div>
        </div>
      </CardDescription>
    </>
  );
};
