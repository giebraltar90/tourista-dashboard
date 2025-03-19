
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VentrataTourGroup } from "@/types/ventrata";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";

interface GroupCapacityAlertProps {
  tourGroups: VentrataTourGroup[];
  isHighSeason: boolean;
}

export const GroupCapacityAlert = ({ tourGroups, isHighSeason }: GroupCapacityAlertProps) => {
  // Early return if no groups
  if (!tourGroups.length) return null;
  
  const totalParticipants = tourGroups.reduce((sum, group) => sum + group.size, 0);
  const standardCapacity = DEFAULT_CAPACITY_SETTINGS.standard;
  const highSeasonCapacity = DEFAULT_CAPACITY_SETTINGS.highSeason;
  const capacity = isHighSeason ? highSeasonCapacity : standardCapacity;
  
  // Calculate group imbalance (if difference is more than 25% of average)
  const averageGroupSize = totalParticipants / tourGroups.length;
  const isUnbalanced = tourGroups.some(group => {
    const sizeDifference = Math.abs(group.size - averageGroupSize);
    const percentDifference = (sizeDifference / averageGroupSize) * 100;
    return percentDifference > 25; // More than 25% difference from average
  });
  
  // Check if exceeding capacity
  const isExceedingCapacity = totalParticipants > capacity;
  
  // Check if groups are appropriately assigned guides
  const unassignedGroups = tourGroups.filter(group => !group.guideId);
  const hasUnassignedGroups = unassignedGroups.length > 0;
  
  // If no issues, don't render anything
  if (!isUnbalanced && !isExceedingCapacity && !hasUnassignedGroups) {
    return null;
  }
  
  return (
    <div className="space-y-2 mb-4">
      {isExceedingCapacity && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Total participants ({totalParticipants}) exceed the {isHighSeason ? "high season" : "standard"} capacity of {capacity}.
          </AlertDescription>
        </Alert>
      )}
      
      {isUnbalanced && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Groups are unbalanced. Consider redistributing participants for a more even distribution.
          </AlertDescription>
        </Alert>
      )}
      
      {hasUnassignedGroups && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {unassignedGroups.length} {unassignedGroups.length === 1 ? 'group is' : 'groups are'} missing guide assignments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
